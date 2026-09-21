from pydantic import BaseModel, Field
from typing import List
from app.schemas.common import TaskType, InputConfigType
from app.schemas.evidence import EvidenceType

class SpecialistCapability(BaseModel):
    name: str
    version: str
    tasks: List[TaskType]
    modalities: List[str]
    input_configurations: List[InputConfigType] = Field(default_factory=list)
    supported_formats: List[str] = Field(default_factory=list)
    evidence_types: List[EvidenceType] = Field(default_factory=list)
    supports_confidence: bool = False
    supports_uncertainty: bool = False
