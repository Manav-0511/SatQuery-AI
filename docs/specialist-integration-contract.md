# Specialist Integration Contract

This document defines the exact steps required to integrate a real ML specialist model into the SatQuery AI (SIH26167) backend without modifying the agent architecture or frontend.

## The Contract

Every specialist must implement the `BaseSpecialist` interface exactly as defined in `app/specialists/base.py`.

To integrate your model, you must:

1. **Implement `BaseSpecialist`**: Create a class inheriting from `BaseSpecialist`.
2. **Declare `SpecialistCapability`**: Define the task(s), supported input modalities, and required outputs.
3. **Implement `can_handle()`**: Return `True` only if your specialist can process the given `AnalysisRequest` and `TaskType`.
4. **Implement `analyze()`**: Process the request and return a standard `SpecialistResult`.
5. **Return `SpecialistResult`**: The result must conform exactly to `app.schemas.response.SpecialistResult`.
6. **Return Provenance**: Include a `Provenance` block indicating `is_real_data`, `synthetic`, and dataset metadata.
7. **Return Structured Evidence**: Use `EvidenceItem` types (`BOUNDING_BOX`, `MASK`, `TEXT`, etc.) if available. If your model does not produce spatial evidence, return an empty evidence list; do not fabricate evidence.
8. **Implement `health()`**: Return a boolean indicating if the underlying model/service is available.
9. **Register Specialist**: Register your instance via `registry.register()` in the application startup phase.
10. **Pass Integration Contract Tests**: Your adapter MUST pass the generic test suite (`backend/tests/contracts/test_generic_specialist_contract.py`).

## Strict Boundaries

- **11. Do not modify the frontend**: The UI relies solely on `ExecutionResult` and `EvidenceItem` definitions.
- **12. Do not modify common API schemas**: Any changes to schemas require a versioned review and team consensus.

By adhering to this contract, the agentic router and execution engine will automatically discover, validate, and execute your model seamlessly.
