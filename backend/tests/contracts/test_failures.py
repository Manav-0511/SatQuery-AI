from app.schemas.request import AnalysisRequest, InputConfiguration, InputItem
from app.schemas.common import TaskType, InputConfigType
from app.agent.executor import execute_specialist
from app.specialists.base import BaseSpecialist, SpecialistCapability

class ExplodingSpecialist(BaseSpecialist):
    @property
    def name(self) -> str: return "Exploder"
    @property
    def version(self) -> str: return "1.0"
    def get_capabilities(self) -> list[SpecialistCapability]:
        return [SpecialistCapability(task=TaskType.VQA, supported_inputs=[InputConfigType.SINGLE_IMAGE])]
    def analyze(self, request, task):
        raise ValueError("Internal CUDA out of memory")
    def health(self) -> bool: return True

class UnavailableSpecialist(BaseSpecialist):
    @property
    def name(self) -> str: return "Unavailable"
    @property
    def version(self) -> str: return "1.0"
    def get_capabilities(self) -> list[SpecialistCapability]:
        return [SpecialistCapability(task=TaskType.VQA, supported_inputs=[InputConfigType.SINGLE_IMAGE])]
    def analyze(self, request, task):
        pass # Won't be called if health is False or we mock it
    def health(self) -> bool: return False

def test_specialist_exception():
    req = AnalysisRequest(
        query="Test",
        input_configuration=InputConfiguration(type="SINGLE_IMAGE"),
        inputs=[InputItem(url="t.tif", type="image/tiff")]
    )
    spec = ExplodingSpecialist()
    res = execute_specialist(req, TaskType.VQA, spec, "run-err")
    assert res.status == "SPECIALIST_FAILED"
    assert "Internal CUDA out of memory" in res.errors[0]

def test_unsupported_task():
    req = AnalysisRequest(
        query="Test",
        input_configuration=InputConfiguration(type="SINGLE_IMAGE"),
        inputs=[InputItem(url="t.tif", type="image/tiff")]
    )
    spec = ExplodingSpecialist()
    # Execute with a task the specialist did not say it supports via can_handle (though executor relies on router, executor should still guard)
    res = execute_specialist(req, TaskType.CHANGE, spec, "run-err2")
    assert res.status == "UNSUPPORTED_TASK"
