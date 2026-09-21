# Agent Model Selection & Execution Planning

This document explains the Phase 7 Agent V2 orchestration logic which transitions the system from simple intent routing to capability-aware multi-step execution planning.

## Overview

The `AgentV2` class handles the orchestration logic. It sits between the incoming API request and the concrete execution layer. 

1. **Input Validation:** Reuses existing validation rules via `PlanValidator`.
2. **Intent & Hinting:** Uses the `query_interpreter` to detect spatial language (for GROUNDING).
3. **Execution Plan Generation:** Instead of directly calling a specialist, the Agent generates an `ExecutionPlan`. The plan consists of one or more `PlanStep`s.
4. **Capability Matching:** The Agent maps the required tasks to the `SpecialistRegistry`, filtering available capabilities.
5. **Specialist Eligibility:** Specifically, the agent checks `rs_adaptation_status`. If a specialist requires RS adaptation, it must be marked as `COMPLETED`.

## Multi-Step Orchestration

Based on the spatial language hints or dual-modality input configurations, the Agent can schedule a multi-step sequence:
- A `BI_TEMPORAL` request with spatial phrasing will generate a 2-step plan: `Execute CHANGE` followed by `Execute GROUNDING`.
- Input and output references (`input_refs` and `output_ref`) strictly pass context between steps in the Execution Plan.

## Execution Trace

The `executor.py` translates the Execution Plan into runtime events via the `ExecutionTrace`. These events are displayed in the frontend for operational transparency:
- `PLAN_CREATED`
- `PLAN_VALIDATION_COMPLETED`
- `STEP_STARTED` (includes specialist model details)
- `STEP_COMPLETED` / `STEP_FAILED`
- `PLAN_COMPLETED`

## Frontend Contract

The frontend remains decoupled from the specific ML models. It consumes the `ExecutionResult`, displaying the final `SpecialistResult` alongside the `ExecutionTrace` steps. It does not parse or interpret the raw `ExecutionPlan`.
