# SatQuery AI - API Runtime

This document describes the runtime execution of the backend API for Phase 4.

## Endpoints

### `GET /api/v1/health`
Returns the status of the service, confirming it is up and running.

### `POST /api/v1/analyze`
Accepts `multipart/form-data` containing:
- `query`: A natural language question.
- `input_configuration`: A JSON string describing the config (e.g. `{"type": "SINGLE_IMAGE"}`).
- `files`: One or more satellite image files.

**Behavior:**
1. Generates a unique `run_id` and records `QUEUED` state in the `RunStore`.
2. Validates inputs via the validation layer.
3. Interprets the query deterministically.
4. Routes to a specific test specialist based on configuration and query.
5. Executes the test specialist via the Executor.
6. Returns an `ExecutionResult` containing the `run_id`, `status`, execution `trace`, and `response` (which holds the `SpecialistResult`).

### `GET /api/v1/runs/{run_id}`
Returns the current `ExecutionResult` state for a given `run_id`. Used for fetching results or long-polling status.

## Lifecycle
The API updates the run state through the following `RunStatus` values:
`QUEUED` → `VALIDATING_INPUT` → `INTERPRETING_QUERY` → `PLANNING` → `RUNNING_SPECIALIST` → `GENERATING_EVIDENCE` → `COMPLETED`

## Error Handling
Any failure in the pipeline returns a structured response matching the `ExecutionResult` schema, with the `status` set to a `FailureStatus` code (e.g. `VALIDATION_FAILED`, `SPECIALIST_UNAVAILABLE`) and diagnostic text populated in the `errors` array. Raw stack traces are never exposed to the API consumer.
