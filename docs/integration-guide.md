# Integration Guide

This guide details how different modules communicate.

## Decoupling Principle

The agent layer must NEVER import directly from the model layer.
Instead, the Model Developer creates a `BaseSpecialist` implementation, and registers it.

## Adding a New Capability

1. Implement `BaseSpecialist`
2. Register during App Startup
3. Add tests to ensure it respects the contract.

## Concrete Integration Boundaries

### How M3 Integrates VQA

1. **Specialist Class**: M3 implements `class RealVQASpecialist(BaseSpecialist)`.
2. **Capabilities**: Declares `TaskType.VQA` and `InputConfigType.SINGLE_IMAGE`.
3. **Adapter**: Maps raw LLM/VLM outputs to `SpecialistResult` and parses `EvidenceItem` types (like `TEXT` or `BOUNDING_BOX`).
4. **Registry Registration**: `registry.register(RealVQASpecialist())` in `main.py`.
5. **Contract Test**: The class is added to `test_adapter_contracts.py` to ensure it passes the generic contract harness.
6. **No Frontend Modification**: The frontend automatically renders the text and coordinates returned in the result.

### How M4 Integrates Change Detection

1. **Specialist Class**: M4 implements `class BiTemporalChangeSpecialist(BaseSpecialist)`.
2. **Capabilities**: Declares `TaskType.CHANGE` and `InputConfigType.BI_TEMPORAL`.
3. **Adapter**: Takes two T1/T2 inputs and formats the resultant change mask into an `EvidenceItem` of type `CHANGE_MAP` or `POLYGON`.
4. **Registry Registration**: `registry.register(BiTemporalChangeSpecialist())`.
5. **Contract Test**: Passes the generic contract tests.
6. **No Frontend Modification**: The frontend dynamically reads the `EvidenceItem` and updates the viewer if a mask URL or polygon is provided.

### How M5 Integrates Optical-SAR Fusion

1. **Specialist Class**: M5 implements `class FusionSpecialist(BaseSpecialist)`.
2. **Capabilities**: Declares `TaskType.OPTICAL_SAR` and `InputConfigType.OPTICAL_SAR`.
3. **Adapter**: Processes multi-modal inputs and returns combined analytical findings with `Provenance` details.
4. **Registry Registration**: `registry.register(FusionSpecialist())`.
5. **Contract Test**: Passed without executor crashes.
6. **No Frontend Modification**: Fully transparent to the UI layer.
