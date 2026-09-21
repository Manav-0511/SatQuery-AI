# SatQuery AI - API Contract

## Versioning

All core APIs must be versioned. The current version is `v1`.
Unversioned endpoints are not allowed for the core public API.

*   `POST /api/v1/analyze`
*   `GET /api/v1/runs/{run_id}`
*   `GET /api/v1/health`

## Query Contract

The frontend sends analysis requests to `/api/v1/analyze` with the following structure:

```json
{
  "query": "Is there water in this region?",
  "inputs": [
    { "url": "blob:...", "type": "image/tiff" }
  ],
  "input_configuration": {
    "type": "SINGLE_IMAGE"
  }
}
```

**Rule:** The frontend must NOT decide the final task (VQA, Grounding, etc.). The Agent determines the task based on the query and input configuration.

## Input Configuration

Supported input configurations for v1:
*   `SINGLE_IMAGE`
*   `BI_TEMPORAL`
*   `OPTICAL_SAR`

## Run ID and Lifecycle

Every analysis request generates a unique `run_id` (e.g., `run_2026_000001`).

The Run object stores:
*   Original request
*   Input metadata
*   Selected task
*   Selected specialist
*   Outputs & Evidence
*   Execution Trace
*   Status & Timestamps
*   Errors/Warnings

### Status States

*   `QUEUED`
*   `VALIDATING_INPUT`
*   `INTERPRETING_QUERY`
*   `PLANNING`
*   `RUNNING_SPECIALIST`
*   `GENERATING_EVIDENCE`
*   `COMPLETED`

### Failure States

Specialist failures must NEVER be hidden with fake reasoning.

*   `VALIDATION_FAILED`
*   `UNSUPPORTED_TASK`
*   `SPECIALIST_UNAVAILABLE`
*   `SPECIALIST_FAILED`
*   `EVIDENCE_FAILED`
*   `INTERNAL_ERROR`

Example Failure Response:
```json
{
  "status": "SPECIALIST_UNAVAILABLE",
  "message": "Grounding analysis is currently unavailable.",
  "run_id": "run_2026_000002"
}
```

## API Boundaries

*   The frontend must ONLY communicate with backend APIs via HTTP.
*   The frontend must NOT import backend Python code.
*   The backend must NOT import React components.
