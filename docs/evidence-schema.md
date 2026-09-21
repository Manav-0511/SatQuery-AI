# SatQuery AI - Evidence Schema

## Task-Independent Evidence Schema

All spatial and visual evidence from specialists must conform to a standardized, task-independent evidence schema. Models return *structured evidence*, NOT rendered images. The frontend Evidence Renderer consumes this structured data to generate overlays.

### Supported Evidence Types

*   `TEXT`
*   `BOUNDING_BOX`
*   `POLYGON`
*   `MASK`
*   `POINT`
*   `CHANGE_REGION`
*   `CHANGE_MAP`
*   `HEATMAP`
*   `MODALITY_EVIDENCE`
*   `IMAGE_REGION`

### Schema Structure

Every piece of evidence inside the `evidence` array (part of `SpecialistResult`) must follow this structure:

```json
{
  "type": "BOUNDING_BOX",
  "coordinates": [100, 80, 300, 250],
  "coordinate_space": "PIXEL",
  "label": "water body",
  "score": 0.91,
  "metadata": {}
}
```

### Coordinate Spaces

The `coordinate_space` field MUST always be explicit. Valid values are:

*   `PIXEL` (e.g., [x1, y1, x2, y2] relative to the image dimensions)
*   `NORMALIZED` (e.g., [0.1, 0.2, 0.5, 0.6] between 0 and 1)
*   `GEO` (e.g., [lat1, lon1, lat2, lon2])

The system must never assume the coordinate system.

## Visual Evidence Architecture

Models should NOT force their own custom frontend images.

```
MODEL
 ↓
STRUCTURED EVIDENCE (JSON schema above)
 ↓
EVIDENCE RENDERER (Frontend)
 ↓
ANNOTATED IMAGE (Displayed to user)
```

### Frontend Capabilities

The frontend must natively support viewing:
1. Original image
2. Annotated/evidence view
3. Bounding boxes
4. Polygons
5. Masks
6. Points
7. Change regions
8. Change maps
9. Optical view
10. SAR view
11. Fused/evidence view

### Handling Missing Evidence

If a specialist provides no spatial evidence (e.g., a pure text VQA model or a Mock):
*   Do NOT invent fake evidence (no fake bounding boxes or maps).
*   The UI must gracefully display: `"Spatial evidence not provided by this specialist."`
