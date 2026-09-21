# SatQuery AI - Agent Routing

This document defines the deterministic routing and input validation policies for the Agent in Phase 2.

## Input Validation Rules

The agent validates all `AnalysisRequest` objects before processing them. 
Validation happens in three layers:
1. **Basic Validation**:
   - Query must not be empty.
   - Input list cannot be empty.
   - `SINGLE_IMAGE` must have exactly 1 input.
   - `BI_TEMPORAL` and `OPTICAL_SAR` must have exactly 2 inputs.
   - Supported formats: `image/tiff`, `image/png`, `image/jpeg`.
2. **Modality Validation**:
   - `OPTICAL_SAR` configuration strictly requires one input to be `OPTICAL` and the other `SAR` via metadata.
3. **Compatibility Validation**:
   - Queries about "change" require `BI_TEMPORAL`.
   - Queries explicitly specifying "optical" and "SAR" together require `OPTICAL_SAR`.

If validation fails, the agent immediately returns a routing result with a `FailureStatus` (e.g., `VALIDATION_FAILED`, `INVALID_INPUT_COUNT`, `MISSING_MODALITY`, `TEMPORAL_PAIR_REQUIRED`) and a clear error message.

## Query Interpretation

The agent uses a deterministic interpreter (v1) to extract task hints from the user's natural language query. It does not use an LLM.

- **CHANGE**: Matches keywords like "change", "increase", "decrease".
- **OPTICAL_SAR**: Matches queries containing both "optical" and "sar".
- **GROUNDING**: Matches spatial keywords like "where", "locate", "highlight", "show me where", "which region", "identify". Attempts to extract the target string implicitly.
- **VQA**: The default fallback if no other specific intent is found (e.g., "Is there water?").

## Routing Priority & Task Mapping

The Router deterministically selects the task in the following order:

1. **Configuration Overrides**:
   - If `BI_TEMPORAL` is the input configuration, the task is automatically `CHANGE`.
   - If `OPTICAL_SAR` is the input configuration, the task is automatically `OPTICAL_SAR`.
2. **Query Hint**:
   - If the configuration is just a `SINGLE_IMAGE`, it relies on the query interpreter.
   - If the interpreter hints `GROUNDING`, the task is `GROUNDING`.
   - Otherwise, fallback to `VQA`.

## Capability Registry Integration

The Router NEVER executes specialists directly. It also avoids hard-coding model names (e.g., no `if GROUNDING: run GeoChat`).

Instead, the Router queries the `SpecialistRegistry` with the chosen `TaskType`.
- The Registry filters available adapters based on whether they support the `TaskType` and `InputConfigType`.
- If candidates are found, the routing state enters `PLANNING`.
- If no specialists are registered for the task, it safely returns `SPECIALIST_UNAVAILABLE`.

## Unsupported Cases

If a query fundamentally contradicts the input configuration (e.g., querying for change but only providing one image), it is rejected during the `validate_compatibility` step. If the router cannot determine a task, it returns `UNSUPPORTED_TASK`.
