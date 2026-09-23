from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import uuid
import json
import time
import base64

from app.schemas.request import AnalysisRequest, InputConfiguration, InputItem
from app.schemas.common import RunStatus, TaskType, InputConfigType, FailureStatus
from app.schemas.execution import ExecutionResult
from app.schemas.trace import ExecutionTrace, TraceStep
from app.store import run_store
from app.agent.router import route_request
from app.agent.executor import execute_specialist
from app.agent.registry import registry
from app.specialists.colab_qwen import ColabQwenSpecialist
from app.specialists.test_doubles.vqa import TestVQASpecialist
from app.specialists.test_doubles.grounding import TestGroundingSpecialist
from app.specialists.test_doubles.change import TestChangeSpecialist
from app.specialists.test_doubles.optical_sar import TestOpticalSARSpecialist

# Register Colab specialist first (handles request if COLAB_API_URL is set)
registry.register(ColabQwenSpecialist())
# Register test doubles for Phase 4 MVP
registry.register(TestVQASpecialist())
registry.register(TestGroundingSpecialist())
registry.register(TestChangeSpecialist())
registry.register(TestOpticalSARSpecialist())

app = FastAPI(title="SatQuery AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "ok",
        "service": "satquery-api",
        "version": "v1"
    }

@app.post("/api/v1/analyze", response_model=ExecutionResult)
async def analyze(
    query: str = Form(default=""),
    input_configuration: str = Form(...),
    files: List[UploadFile] = File(default=[])
):
    run_id = str(uuid.uuid4())
    start_time = int(time.time() * 1000)
    
    # Create initial run state
    initial_trace = ExecutionTrace(run_id=run_id, steps=[TraceStep(step="0", action="QUEUED", component="api", status=RunStatus.QUEUED)], total_time_ms=0)
    initial_state = ExecutionResult(run_id=run_id, status=RunStatus.QUEUED, trace=initial_trace)
    run_store.create_run(run_id, initial_state)
    
    # Parse input config
    try:
        config_dict = json.loads(input_configuration)
        config = InputConfiguration(**config_dict)
    except Exception as e:
        err_res = ExecutionResult(
            run_id=run_id, status=FailureStatus.INTERNAL_ERROR,
            trace=initial_trace, errors=[f"Invalid input_configuration JSON: {str(e)}"]
        )
        run_store.update_run(run_id, err_res)
        return err_res

    # Construct request
    inputs = []
    for f in files:
        file_bytes = await f.read()
        b64_str = base64.b64encode(file_bytes).decode("utf-8")
        
        modality = ""
        if "sar" in f.filename.lower() or "s1" in f.filename.lower():
            modality = "SAR"
        elif "optical" in f.filename.lower() or "s2" in f.filename.lower() or "rgb" in f.filename.lower():
            modality = "OPTICAL"
            
        inputs.append(InputItem(url=f.filename, type=f.content_type or "image/tiff", metadata={"bytes": b64_str, "modality": modality}))

    request = AnalysisRequest(
        query=query,
        input_configuration=config,
        inputs=inputs
    )

    # 3. Route
    route_res = route_request(request)
    
    if route_res.status not in ["PLANNING"]:
        # Means routing failed (e.g. VALIDATION_FAILED, SPECIALIST_UNAVAILABLE, etc)
        err_res = ExecutionResult(
            run_id=run_id, status=route_res.status,
            trace=ExecutionTrace(run_id=run_id, steps=[
                TraceStep(step="1", action="ROUTING_FAILED", component="router", status=route_res.status, details={"reason": route_res.reason})
            ], total_time_ms=int(time.time() * 1000) - start_time),
            errors=[route_res.reason]
        )
        run_store.update_run(run_id, err_res)
        return err_res

    from app.agent.executor import execute_plan
    
    # 4. Execute
    exec_res = execute_plan(request, route_res.plan, run_id=run_id)
    
    run_store.update_run(run_id, exec_res)
    return exec_res

@app.get("/api/v1/runs/{run_id}", response_model=ExecutionResult)
async def get_run(run_id: str):
    run = run_store.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return run
