# Specialist Model Handoff Contract

This document defines the exact information, artifacts, and operational specifications that ML engineers must provide when handing over a remote-sensing specialist model to the integration team.

Before a model can be integrated into the SatQuery AI (SIH26167) orchestration layer, the following handoff checklist must be complete.

## 1. Model Identity
- **Model Name**: The human-readable name of the model (e.g., `sat-vqa-base`).
- **Version**: Semantic version (e.g., `v1.2.0`).
- **Capability / Task Type**: Which specific task this model solves (`VQA`, `GROUNDING`, `CHANGE`, `OPTICAL_SAR`).

## 2. Artifacts & Runtime
- **Checkpoint / Weights Location**: Path to the model weights (e.g., internal HuggingFace hub, S3 bucket path, or network drive).
- **Runtime / Dependencies**: Exact Python environment requirements (e.g., PyTorch version, CUDA version, HuggingFace transformers version). Provide a `requirements.txt` or `conda.yaml` specific to the model.
- **Hardware Requirements**: Minimum vRAM, recommended GPU type (e.g., A100 40GB, RTX 4090).

## 3. Input Specification
- **Input Requirements**: Spatial resolution (e.g., 10m/px), image sizes (e.g., 512x512).
- **Modality Requirements**: Required bands (e.g., RGB, Near-Infrared, SAR VV/VH).
- **Preprocessing Logic**: Any required normalization, resizing, or tiling logic that must occur before the model's `forward()` pass. 

## 4. Output Specification
- **Inference Interface**: Provide a simple Python class or function demonstrating how to invoke the model.
- **Output Schema**: The raw output structure the model produces before adapter translation.
- **Confidence / Uncertainty Behavior**: How does the model express confidence (0.0 to 1.0)? Does it provide an uncertainty metric? 

## 5. Evidence Schema Mapping
Specify how the model's spatial outputs map to the agent's `EvidenceItem` types:
- Does it produce bounding boxes? (Format: `[x_min, y_min, x_max, y_max]` in `PIXEL` or `GEO` space?)
- Does it produce segmentation masks? (Format: binary array, RLE, or geo-referenced polygon?)
- Does it produce change maps?

## 6. Provenance & Metadata
- What dataset was this model trained on?
- What metadata needs to be propagated with the result (e.g., `is_real_data`, `synthetic` flags)?

## 7. Known Limitations
- Are there specific weather conditions (e.g., heavy cloud cover) where the model fails silently?
- Does it hallucinate on purely urban vs. purely rural tiles?
- Maximum token limits for VQA queries?

## 8. Real Inference Example
Provide at least one *real* (not synthetic, not dummy) example of an input and the exact, raw output the model produces, so the integration engineer can write the `BaseSpecialist` adapter and write contract tests.
