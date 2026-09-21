from datetime import datetime, timezone
import time
from app.schemas.request import AnalysisRequest
from app.schemas.common import TaskType, RunStatus, FailureStatus
from app.schemas.response import SpecialistResult
from app.schemas.execution import ExecutionResult
from app.schemas.trace import ExecutionTrace, TraceStep
from app.agent.router import SpecialistCandidateInfo
from app.agent.registry import registry
from pydantic import ValidationError

def create_trace_step(step: str, action: str, component: str, status: str, details: dict = None) -> TraceStep:
    return TraceStep(
        step=step,
        action=action,
        component=component,
        status=status,
        details=details or {}
    )

def execute_specialist(request: AnalysisRequest, task: TaskType, candidate: SpecialistCandidateInfo, run_id: str = "test-run") -> ExecutionResult:
    trace_steps = []
    start_ms = int(time.time() * 1000)
    
    # Trace logic based on prompt
    trace_steps.append(create_trace_step("1", "INPUT_VALIDATION", "executor", RunStatus.COMPLETED))
    trace_steps.append(create_trace_step("2", "QUERY_INTERPRETATION", "executor", RunStatus.COMPLETED))
    trace_steps.append(create_trace_step("3", "TASK_SELECTION", "executor", RunStatus.COMPLETED))
    trace_steps.append(create_trace_step("4", "SPECIALIST_SELECTION", "executor", RunStatus.COMPLETED))

    # Get specialist from registry
    specialists = registry.get_all()
    selected_specialist = None
    for s in specialists:
        if s.name == candidate.name and s.version == candidate.version:
            selected_specialist = s
            break
            
    if not selected_specialist:
        trace_steps.append(create_trace_step("5", "SPECIALIST_EXECUTION_FAILED", "executor", FailureStatus.SPECIALIST_UNAVAILABLE))
        return ExecutionResult(
            run_id=run_id,
            status=FailureStatus.SPECIALIST_UNAVAILABLE,
            trace=ExecutionTrace(run_id=run_id, steps=trace_steps, total_time_ms=int(time.time() * 1000) - start_ms),
            errors=["Specialist not found in registry."]
        )

    if not selected_specialist.can_handle(request):
        trace_steps.append(create_trace_step("5", "SPECIALIST_EXECUTION_FAILED", "executor", FailureStatus.UNSUPPORTED_TASK))
        return ExecutionResult(
            run_id=run_id,
            status=FailureStatus.UNSUPPORTED_TASK,
            trace=ExecutionTrace(run_id=run_id, steps=trace_steps, total_time_ms=int(time.time() * 1000) - start_ms),
            errors=["Specialist rejected the request (can_handle returned false)."]
        )

    trace_steps.append(create_trace_step("5", "SPECIALIST_EXECUTION_STARTED", "executor", RunStatus.RUNNING_SPECIALIST))
    
    # Execute
    try:
        raw_result = selected_specialist.analyze(request)
    except Exception as e:
        # Catch all exceptions and return controlled failure
        trace_steps.append(create_trace_step("6", "SPECIALIST_EXECUTION_FAILED", "specialist", FailureStatus.SPECIALIST_FAILED))
        return ExecutionResult(
            run_id=run_id,
            status=FailureStatus.SPECIALIST_FAILED,
            trace=ExecutionTrace(run_id=run_id, steps=trace_steps, total_time_ms=int(time.time() * 1000) - start_ms),
            errors=[f"Specialist raised an exception: {str(e)}"]
        )

    trace_steps.append(create_trace_step("6", "SPECIALIST_EXECUTION_COMPLETED", "specialist", RunStatus.COMPLETED))

    # Validate output schema
    if not isinstance(raw_result, SpecialistResult):
        # We also want to validate via Pydantic if it was a dict, but we assume analyze returns the object or we try to parse it.
        # Let's enforce that it's a valid SpecialistResult object
        trace_steps.append(create_trace_step("7", "RESULT_VALIDATION_FAILED", "executor", FailureStatus.SPECIALIST_FAILED))
        return ExecutionResult(
            run_id=run_id,
            status=FailureStatus.SPECIALIST_FAILED,
            trace=ExecutionTrace(run_id=run_id, steps=trace_steps, total_time_ms=int(time.time() * 1000) - start_ms),
            errors=["INVALID_SPECIALIST_RESULT: Result is not a valid SpecialistResult"]
        )
        
    try:
        # Pydantic validation roundtrip to ensure schema compliance if it's somehow malformed internally
        # (Though Type Checkers catch most, doing model_validate ensures data integrity)
        SpecialistResult.model_validate(raw_result.model_dump())
    except ValidationError:
        trace_steps.append(create_trace_step("7", "RESULT_VALIDATION_FAILED", "executor", FailureStatus.SPECIALIST_FAILED))
        return ExecutionResult(
            run_id=run_id,
            status=FailureStatus.SPECIALIST_FAILED,
            trace=ExecutionTrace(run_id=run_id, steps=trace_steps, total_time_ms=int(time.time() * 1000) - start_ms),
            errors=["INVALID_SPECIALIST_RESULT: Result failed Pydantic validation"]
        )

    trace_steps.append(create_trace_step("7", "RESULT_VALIDATED", "executor", RunStatus.COMPLETED))

    # Provenance preservation is done implicitly by returning the raw_result.provenance unaltered, 
    # but we can add executor metadata to ExecutionResult timings etc.
    
    trace_steps.append(create_trace_step("8", "EXECUTION_COMPLETED", "executor", RunStatus.COMPLETED))

    return ExecutionResult(
        run_id=run_id,
        status=RunStatus.COMPLETED,
        response=raw_result,
        trace=ExecutionTrace(run_id=run_id, steps=trace_steps, total_time_ms=int(time.time() * 1000) - start_ms),
        errors=[]
    )
