# SatQuery AI - Integration Guide for Teammates

This guide explains how to integrate your ML models into the SatQuery AI system.

**IMPORTANT: To integrate your model, you MUST NOT modify the frontend, the agent orchestration layer, or the common schemas.**

## The Integration Process

To integrate your model into SatQuery:

1.  **Implement `BaseSpecialist`**: Create a class that implements the `BaseSpecialist` interface.
2.  **Create a Model-Specific Adapter**: Wrap your model logic inside this adapter class.
3.  **Declare Capabilities**: Implement the `capabilities` property to define what your model can handle (tasks, modalities, evidence formats).
4.  **Implement `analyze()`**: This method should accept the standardized request, run your model, and normalize the output.
5.  **Return `SpecialistResult`**: Ensure `analyze()` returns the exact `SpecialistResult` schema (see `specialist-contract.md`).
6.  **Return Structured Evidence**: Ensure any visual or spatial output is returned as structured evidence items (see `evidence-schema.md`). Do NOT generate images for the frontend.
7.  **Return Provenance**: Include provenance data (dataset, checkpoint, modality) if applicable.
8.  **Add `health()`**: Implement the health check method to indicate if your model is loaded and ready.
9.  **Add Unit/Smoke Tests**: Ensure your adapter can process a valid request and return a valid result.
10. **Register Adapter**: Register your adapter in the Agent's Specialist Registry.
11. **Do NOT Modify Frontend**: The frontend is fully decoupled and will render your structured evidence automatically.
12. **Do NOT Modify Common Schemas**: Do not add custom fields to `SpecialistResult` unless discussed and versioned as a team.

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
