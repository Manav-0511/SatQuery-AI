# SatQuery AI - Specialist Contract

## Universal Specialist Interface

All AI models must implement a single universal interface via the Adapter Pattern. This ensures the orchestration layer remains independent of the underlying ML implementation.

### The `BaseSpecialist` Interface

```python
class BaseSpecialist:
    @property
    def name(self) -> str:
        ...

    @property
    def version(self) -> str:
        ...
        
    @property
    def capabilities(self) -> dict:
        ...

    def can_handle(self, request) -> bool:
        ...

    def analyze(self, request) -> 'SpecialistResult':
        ...

    def health(self) -> 'SpecialistHealth':
        ...
```

Individual specialists are NOT allowed to invent incompatible response formats.

## Specialist Capability Metadata

Every specialist must declare its capabilities so the agent can discover it.

Example VQA Capability:
```json
{
  "name": "mock-vqa",
  "version": "1.0",
  "tasks": ["VQA"],
  "modalities": ["OPTICAL"],
  "input_counts": [1],
  "formats": ["TIFF", "GEOTIFF"],
  "evidence_types": ["TEXT", "BOUNDING_BOX"],
  "supports_confidence": true
}
```

Example Change Detection Capability:
```json
{
  "name": "mock-change",
  "version": "1.0",
  "tasks": ["CHANGE"],
  "modalities": ["OPTICAL", "SAR"],
  "input_counts": [2],
  "evidence_types": ["CHANGE_MAP", "POLYGON"]
}
```

## Specialist Result Contract

Every specialist's `analyze` method MUST return a standardized `SpecialistResult`. The orchestration layer depends on this exact structure.

```json
{
  "status": "SUCCESS",
  "task": "VQA",
  "answer": "Yes, there is water in the lower right quadrant.",
  "model": {
    "name": "mock-vqa",
    "version": "1.0"
  },
  "confidence": 0.95,
  "uncertainty": null,
  "evidence": [],
  "provenance": {
    "source_type": "S2",
    "dataset": "SIH-Dataset-A",
    "model": "mock-vqa-checkpoint-1",
    "is_real_data": false
  },
  "warnings": [],
  "timing": {
    "inference_ms": 150
  }
}
```

### Note on Confidence
If a specialist cannot provide calibrated confidence, it must set `confidence: null`. Do NOT generate fake confidence values. The UI will gracefully display "Confidence not provided by specialist."

## Provenance
The agent preserves provenance data exactly as returned by the specialist output. It must not overwrite model provenance.

## Adapter Pattern

Models are wrapped in Adapters to fulfill the `BaseSpecialist` contract.

```
BaseSpecialist (Interface)
    ↑
VQAAdapter (Implements BaseSpecialist)
    ↓
GeoChat Model (Actual Implementation)
```

If the ML team updates the model, only the Adapter changes. The Agent orchestration code remains untouched.
