# SatQuery AI - Integration Guide for Teammates

This guide explains how to integrate your ML models into the SatQuery AI system.

**IMPORTANT: To integrate your model, you MUST NOT modify the frontend, the agent orchestration layer, or the common schemas.**

## The Integration Process

To integrate a real specialist:

1. Implement BaseSpecialist.
2. Implement model adapter.
3. Declare capabilities.
4. Return SpecialistResult.
5. Return provenance.
6. Return structured evidence if available.
7. Register adapter.
8. Pass contract tests.
9. No frontend changes required.

## Example

Suppose you built a new VQA model called `MyVQAModel`.

1. Create `MyVQAAdapter` implementing `BaseSpecialist`.
2. Inside `MyVQAAdapter.analyze()`, format the input for `MyVQAModel`.
3. Receive the output from `MyVQAModel`.
4. Parse the output into a `SpecialistResult` dictionary.
5. In `registry.py`, map the `VQA` task to `MyVQAAdapter`.

The agent will now automatically discover and route VQA requests to your model.

## Contract Testing

Any teammate's module MUST pass the generic specialist contract test before integration. This test verifies:
*   Adapter has name and version.
*   Declares valid capabilities.
*   Accepts a valid request.
*   Returns a valid `SpecialistResult`.
*   Result task matches the expected task.
*   Evidence follows the schema.
*   Errors are represented using standard status codes.
