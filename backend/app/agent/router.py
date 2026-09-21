from pydantic import BaseModel
from typing import List
from app.schemas.request import AnalysisRequest
from app.schemas.common import TaskType, InputConfigType, FailureStatus
from app.agent.query_interpreter import interpret_query
from app.validation.compatibility import validate_request_full
from app.agent.registry import registry

class SpecialistCandidateInfo(BaseModel):
    name: str
    version: str

class RoutingResult(BaseModel):
    status: str
    task: TaskType | str
    reason: str
    candidates: List[SpecialistCandidateInfo]

def route_request(request: AnalysisRequest) -> RoutingResult:
    # 1. Validate configuration first.
    validation_res = validate_request_full(request)
    if not validation_res.valid:
        # Get the first error code
        code = validation_res.errors[0].code
        if isinstance(code, FailureStatus):
            code = code.value
        return RoutingResult(
            status=code,
            task=TaskType.UNKNOWN,
            reason=validation_res.errors[0].message,
            candidates=[]
        )
        
    config_type = request.input_configuration.type
    
    # 2 & 3 & 4. Routing Priority
    candidate_task = TaskType.UNKNOWN
    reason = ""
    
    query_interp = interpret_query(request.query)
    
    if config_type == InputConfigType.BI_TEMPORAL:
        candidate_task = TaskType.CHANGE
        reason = "Input configuration is BI_TEMPORAL"
    elif config_type == InputConfigType.OPTICAL_SAR:
        candidate_task = TaskType.OPTICAL_SAR
        reason = "Input configuration is OPTICAL_SAR"
    elif query_interp.task_hint == TaskType.GROUNDING:
        candidate_task = TaskType.GROUNDING
        reason = "Spatial language detected in query"
    else:
        candidate_task = TaskType.VQA
        reason = "Default fallback to VQA"
        
    if query_interp.task_hint == TaskType.CHANGE and config_type != InputConfigType.BI_TEMPORAL:
        # Handled by validator mostly, but just in case
        return RoutingResult(
            status=FailureStatus.UNSUPPORTED_TASK,
            task=TaskType.UNKNOWN,
            reason="Change detection requires BI_TEMPORAL inputs",
            candidates=[]
        )
        
    if candidate_task == TaskType.UNKNOWN:
        return RoutingResult(
            status=FailureStatus.UNSUPPORTED_TASK,
            task=TaskType.UNKNOWN,
            reason="Could not determine task from query and configuration",
            candidates=[]
        )
        
    # 5. Discover capabilities in registry
    candidates = registry.find_candidates(request, candidate_task)
    
    if not candidates:
        return RoutingResult(
            status=FailureStatus.SPECIALIST_UNAVAILABLE,
            task=candidate_task,
            reason=f"No specialists registered for task {candidate_task.value}",
            candidates=[]
        )
        
    candidate_infos = [SpecialistCandidateInfo(name=c.name, version=c.version) for c in candidates]
    
    return RoutingResult(
        status="PLANNING",
        task=candidate_task,
        reason=reason,
        candidates=candidate_infos
    )
