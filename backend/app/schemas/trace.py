from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime

class TraceStep(BaseModel):
    step: str
    action: str
    component: str
    status: str
    details: Optional[dict[str, Any]] = Field(default_factory=dict)

class ExecutionTrace(BaseModel):
    run_id: str
    steps: List[TraceStep] = Field(default_factory=list)
    total_time_ms: Optional[int] = None
