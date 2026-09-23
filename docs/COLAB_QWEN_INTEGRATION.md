# Google Colab Qwen2-VL Integration

This document outlines how the SatQuery backend integrates with the Qwen2-VL inference API running on Google Colab.

## Architecture

The integration leverages the existing Agent and Specialist architecture without modifying the core routing logic.

1.  **Frontend**: Sends a `multipart/form-data` request containing the user's query and image(s).
2.  **FastAPI Backend (`main.py`)**: 
    *   Reads the incoming image bytes.
    *   Base64 encodes the images.
    *   Stores the base64 string in the `InputItem` metadata.
    *   The router selects the `ColabQwenSpecialist` if it is configured.
3.  **ColabQwenSpecialist (`app/specialists/colab_qwen.py`)**:
    *   Acts as a bridge. It checks if the `COLAB_API_URL` is configured.
    *   Packages the query and base64 images into a JSON payload.
    *   Sends a POST request to the Colab API with a 120-second timeout.
4.  **Colab Environment**:
    *   Runs the Qwen2-VL model on a GPU.
    *   Receives the JSON payload, runs inference, and returns the answer.
5.  **Response**: The specialist wraps the text answer in a standard `SpecialistResult`, which is sent back to the frontend.

## Environment Variable

To enable the Colab integration, you must set the following environment variable before starting the backend:

```bash
export COLAB_API_URL="https://<your-ngrok-or-localtunnel-id>.ngrok-free.app"
```

*Note: Do not append `/analyze` to the URL; the backend will append it automatically.*

If `COLAB_API_URL` is not set, the `ColabQwenSpecialist` will report itself as unconfigured, and the system will fall back to using the local test doubles (e.g., `TestVQASpecialist`).

## Request / Response Contract

The interaction between the backend and Colab occurs over HTTP POST with JSON payloads.

**Conceptual Request sent to Colab (`POST {COLAB_API_URL}/analyze`)**:
```json
{
  "query": "Is there a building in this image?",
  "images": [
    "base64_encoded_string_1",
    "base64_encoded_string_2"
  ],
  "task_type": "SINGLE_IMAGE"
}
```

**Expected Response from Colab**:
```json
{
  "answer": "Yes, there is a large building visible in the center.",
  "model": "Qwen2-VL-7B-Instruct"
}
```

## How to Run the Backend

To run the backend with the Colab integration active:

1. Start your Colab notebook and obtain the public URL (e.g., via ngrok).
2. Set the environment variable in your terminal:
   ```bash
   # On Linux/macOS
   export COLAB_API_URL="https://your-colab-url.ngrok.app"
   
   # On Windows (PowerShell)
   $env:COLAB_API_URL="https://your-colab-url.ngrok.app"
   ```
3. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload
   ```

## How to Test Without Colab

The integration includes unit tests that mock the HTTP boundary, ensuring you can test the backend logic without needing an active Colab GPU instance.

Furthermore, if you do not set `COLAB_API_URL`, you can run the application normally and it will use the `TestVQASpecialist` and other test doubles for instantaneous, mocked responses.

To run the unit tests for the Colab specialist:
```bash
python -m pytest tests/unit/test_colab_qwen.py
```
