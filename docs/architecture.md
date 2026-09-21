# SatQuery AI - Architecture Overview

## Target Architecture

The core philosophy of SatQuery AI is **Contract-First and Adapter-Based**. The agent and frontend are fully decoupled from the underlying ML models (Specialists).

```
USER
 ↓
NEXT.JS FRONTEND
 ↓
VERSIONED REST API (/api/v1/analyze)
 ↓
ANALYSIS SERVICE
 ↓
INPUT VALIDATOR
 ↓
QUERY UNDERSTANDING
 ↓
AGENT PLANNER
 ↓
SPECIALIST REGISTRY
 ↓
SPECIALIST ADAPTER
 ↓
REAL MODEL / TOOL
 ↓
STANDARDIZED RESULT
 ↓
EVIDENCE SERVICE
 ↓
FINAL RESPONSE
 ↓
FRONTEND RESULT VIEW
```

### Key Principles

1. **Decoupling**: The agent and frontend must NOT know about model-specific internal code (e.g., GeoChat, ResNet).
2. **Adapter Pattern**: All specialists are integrated via Adapters that conform to a strict interface.
3. **Capability-based Routing**: The agent decides which specialist to use based on declared capabilities in the Registry, not hardcoded model names.

## Agent Pipeline

The execution flow for an analysis request follows these independent steps:

1. **REQUEST**: Receive API request.
2. **VALIDATE**: Ensure input format and configuration are valid.
3. **QUERY UNDERSTANDING**: Parse user query.
4. **CAPABILITY DISCOVERY**: Ask the registry what specialists can handle the request.
5. **TASK SELECTION**: Determine the required task (e.g., VQA, GROUNDING, CHANGE).
6. **SPECIALIST SELECTION**: Choose the appropriate specialist from compatible candidates.
7. **EXECUTION**: Run the specialist adapter.
8. **RESULT NORMALIZATION**: Convert specialist output to standard schema.
9. **EVIDENCE COLLECTION**: Gather structured visual/spatial evidence.
10. **RELIABILITY HANDLING**: Process confidence, uncertainty, and errors.
11. **FINAL RESPONSE**: Return to frontend.

## Agent Routing - Version 1

Version 1 uses a **Deterministic Agent Policy** (not an LLM for routing).

*   **ONE IMAGE + "Is there water?"** → `VQA`
*   **ONE IMAGE + "Where is the water?"** → `GROUNDING`
*   **T1 + T2 + "What changed?"** → `CHANGE`
*   **OPTICAL + SAR + "Use both images..."** → `OPTICAL_SAR`
*   **Unsupported configuration** → `VALIDATION_FAILED`

## Dependency Rules

Dependencies must flow strictly inwards/downwards:

`frontend` → `HTTP API` → `agent` → `specialist contracts` → `specialist adapters` → `actual models`

**Prohibited Dependencies:**
*   Frontend importing specific models.
*   Agent importing model internals.
*   Specialists importing frontend code (e.g., React).
*   Circular dependencies.

## Frontend Architecture

The frontend (Next.js) only understands the stable API result. It renders components based on the OUTPUT TYPE (e.g., `AnswerPanel`, `ChangeMapViewer`), never the INTERNAL MODEL.
