import pytest
from app.schemas.request import AnalysisRequest, InputConfiguration, InputItem
from app.schemas.common import InputConfigType, TaskType, FailureStatus, RunStatus
from app.schemas.response import SpecialistResult
from app.agent.router import SpecialistCandidateInfo
from app.agent.executor import execute_specialist
from app.agent.registry import registry
from app.specialists.test_doubles.vqa import TestVQASpecialist
from app.specialists.base import BaseSpecialist, SpecialistHealth
from app.agent.capabilities import SpecialistCapability

class BadSpecialist(BaseSpecialist):
    @property
    def name(self) -> str: return "bad"
    @property
    def version(self) -> str: return "1.0"
    @property
    def capabilities(self) -> SpecialistCapability:
        return SpecialistCapability(name="bad", version="1.0", tasks=[TaskType.VQA], modalities=["OPTICAL"])
    def can_handle(self, request: AnalysisRequest) -> bool: return True
    def analyze(self, request: AnalysisRequest) -> SpecialistResult:
        raise ValueError("Simulated crash")
    def health(self) -> SpecialistHealth: return SpecialistHealth(status="OK")

class MalformedSpecialist(BaseSpecialist):
    @property
    def name(self) -> str: return "malformed"
    @property
    def version(self) -> str: return "1.0"
    @property
    def capabilities(self) -> SpecialistCapability:
        return SpecialistCapability(name="malformed", version="1.0", tasks=[TaskType.VQA], modalities=["OPTICAL"])
    def can_handle(self, request: AnalysisRequest) -> bool: return True
    def analyze(self, request: AnalysisRequest) -> SpecialistResult:
        return {"not": "a SpecialistResult object"} # type: ignore
    def health(self) -> SpecialistHealth: return SpecialistHealth(status="OK")

class RejectSpecialist(BaseSpecialist):
    @property
    def name(self) -> str: return "reject"
    @property
    def version(self) -> str: return "1.0"
    @property
    def capabilities(self) -> SpecialistCapability:
        return SpecialistCapability(name="reject", version="1.0", tasks=[TaskType.VQA], modalities=["OPTICAL"])
    def can_handle(self, request: AnalysisRequest) -> bool: return False
    def analyze(self, request: AnalysisRequest) -> SpecialistResult:
        pass
    def health(self) -> SpecialistHealth: return SpecialistHealth(status="OK")

@pytest.fixture(autouse=True)
def setup_registry():
    registry._specialists = []
    registry.register(TestVQASpecialist())
    registry.register(BadSpecialist())
    registry.register(MalformedSpecialist())
    registry.register(RejectSpecialist())

def get_base_request():
    return AnalysisRequest(
        query="Is there water?",
        inputs=[InputItem(url="1.tif", type="image/tiff")],
        input_configuration=InputConfiguration(type=InputConfigType.SINGLE_IMAGE)
    )

def test_missing_specialist():
    req = get_base_request()
    res = execute_specialist(req, TaskType.VQA, SpecialistCandidateInfo(name="non-existent", version="1.0"))
    assert res.status == FailureStatus.SPECIALIST_UNAVAILABLE
    assert "not found in registry" in res.errors[0]

def test_reject_request():
    req = get_base_request()
    res = execute_specialist(req, TaskType.VQA, SpecialistCandidateInfo(name="reject", version="1.0"))
    assert res.status == FailureStatus.UNSUPPORTED_TASK
    assert "rejected the request" in res.errors[0]

def test_specialist_exception():
    req = get_base_request()
    res = execute_specialist(req, TaskType.VQA, SpecialistCandidateInfo(name="bad", version="1.0"))
    assert res.status == FailureStatus.SPECIALIST_FAILED
    assert "Simulated crash" in res.errors[0]
    assert res.trace.steps[-1].status == FailureStatus.SPECIALIST_FAILED

def test_malformed_result():
    req = get_base_request()
    res = execute_specialist(req, TaskType.VQA, SpecialistCandidateInfo(name="malformed", version="1.0"))
    assert res.status == FailureStatus.SPECIALIST_FAILED
    assert "INVALID_SPECIALIST_RESULT" in res.errors[0]

def test_successful_execution():
    req = get_base_request()
    res = execute_specialist(req, TaskType.VQA, SpecialistCandidateInfo(name="test-vqa", version="test"))
    assert res.status == RunStatus.COMPLETED
    assert res.response.task == TaskType.VQA
    assert res.response.answer == "TEST_ONLY_RESULT"
    # confidence is null
    assert res.response.confidence is None
    # evidence is preserved (empty)
    assert res.response.evidence == []
    # provenance preserved
    assert res.response.provenance.synthetic is True
    # trace generated
    steps = [s.action for s in res.trace.steps]
    assert "SPECIALIST_EXECUTION_STARTED" in steps
    assert "SPECIALIST_EXECUTION_COMPLETED" in steps
    assert "RESULT_VALIDATED" in steps
