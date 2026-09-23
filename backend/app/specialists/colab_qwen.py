import os
import base64
import httpx
from app.specialists.base import BaseSpecialist, SpecialistHealth
from app.agent.capabilities import SpecialistCapability
from app.schemas.request import AnalysisRequest
from app.schemas.response import SpecialistResult, ModelInfo
from app.schemas.common import TaskType, InputConfigType
from app.schemas.provenance import Provenance

class ColabQwenSpecialist(BaseSpecialist):
    @property
    def name(self) -> str:
        return "colab-qwen-vl"

    @property
    def version(self) -> str:
        return "1.0"

    @property
    def capabilities(self) -> SpecialistCapability:
        return SpecialistCapability(
            capability_id="satquery.colab.qwen2vl",
            name=self.name,
            version=self.version,
            model_id="qwen2-vl",
            model_version="latest",
            tasks=[TaskType.VQA, TaskType.GROUNDING, TaskType.CHANGE, TaskType.OPTICAL_SAR],
            supported_tasks=[TaskType.VQA, TaskType.GROUNDING, TaskType.CHANGE, TaskType.OPTICAL_SAR],
            modalities=["OPTICAL", "SAR"],
            supported_modalities=["OPTICAL", "SAR"],
            input_configurations=[InputConfigType.SINGLE_IMAGE, InputConfigType.BI_TEMPORAL, InputConfigType.OPTICAL_SAR],
            supported_input_count=2,
            requires_rs_adaptation=False,
            status="AVAILABLE"
        )

    def can_handle(self, request: AnalysisRequest) -> bool:
        return bool(os.environ.get("COLAB_API_URL"))

    def analyze(self, request: AnalysisRequest) -> SpecialistResult:
        colab_url = os.environ.get("COLAB_API_URL")
        if not colab_url:
            return SpecialistResult(
                status="FAILED",
                task=TaskType.VQA,
                answer="COLAB_API_URL environment variable is not set.",
                model=ModelInfo(name=self.name, version=self.version),
                warnings=["Configuration Error: Colab URL missing"]
            )

        # Extract base64 images
        images = []
        for inp in request.inputs:
            if "bytes" in inp.metadata:
                images.append(inp.metadata["bytes"])
            else:
                # Fallback if bytes weren't passed (shouldn't happen with our main.py change)
                images.append("") 

        payload = {
            "query": request.query,
            "images": images,
            "task_type": request.input_configuration.type.value
        }

        try:
            with httpx.Client(timeout=120.0) as client:
                response = client.post(f"{colab_url.rstrip('/')}/analyze", json=payload)
                response.raise_for_status()
                data = response.json()
                
                answer = data.get("answer", "")
                if not answer:
                    return SpecialistResult(
                        status="FAILED",
                        task=TaskType.VQA,
                        answer="Received empty answer from Colab API.",
                        model=ModelInfo(name=self.name, version=self.version),
                        warnings=["Empty answer from model"]
                    )
                
                model_name = data.get("model", "Qwen2-VL")
                
                return SpecialistResult(
                    status="SUCCESS",
                    task=TaskType.VQA, # Hardcoded task logic for now; could map based on request if needed
                    answer=answer,
                    model=ModelInfo(name=self.name, version=self.version, provider="colab", checkpoint=model_name),
                    provenance=Provenance(synthetic=False, is_real_data=True)
                )

        except httpx.TimeoutException:
            return SpecialistResult(
                status="FAILED",
                task=TaskType.VQA,
                answer="Request to Colab API timed out after 120 seconds.",
                model=ModelInfo(name=self.name, version=self.version),
                warnings=["TimeoutException"]
            )
        except httpx.RequestError as e:
            return SpecialistResult(
                status="FAILED",
                task=TaskType.VQA,
                answer=f"Network error connecting to Colab API: {str(e)}",
                model=ModelInfo(name=self.name, version=self.version),
                warnings=["RequestError"]
            )
        except Exception as e:
             return SpecialistResult(
                status="FAILED",
                task=TaskType.VQA,
                answer=f"Unexpected error communicating with Colab: {str(e)}",
                model=ModelInfo(name=self.name, version=self.version),
                warnings=[str(e)]
            )

    def health(self) -> SpecialistHealth:
        if not os.environ.get("COLAB_API_URL"):
            return SpecialistHealth(status="UNCONFIGURED", details="COLAB_API_URL not set")
        return SpecialistHealth(status="OK")
