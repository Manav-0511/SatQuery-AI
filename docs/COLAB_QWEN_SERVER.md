# Qwen2-VL Colab Server Guide

This guide explains how to spin up the Qwen2-VL inference server on Google Colab so the SatQuery backend can communicate with it.

## 1. Colab Setup & GPU Requirement

1. Upload `notebooks/qwen2vl_colab_server.ipynb` to Google Colab.
2. Ensure you are using a GPU runtime:
   * **Runtime > Change runtime type**
   * Select **T4 GPU** (or better, e.g., L4, A100).
   * **Save**.

## 2. Dependencies

The notebook installs the following automatically in its first cell:
```bash
pip install fastapi uvicorn pyngrok qwen-vl-utils transformers torchvision pillow pydantic accelerate nest-asyncio
```

## 3. Launching the Server

1. **Run Cell 1**: Installs dependencies.
2. **Run Cell 2**: Downloads and loads the `Qwen/Qwen2-VL-2B-Instruct` model into GPU memory. This takes ~2-3 minutes. The model will remain resident in VRAM.
3. **Run Cell 3**: Defines the FastAPI server and endpoints.
4. **Run Cell 4**: Starts `ngrok` and the `uvicorn` server. 

## 4. Obtaining the Public URL

When you run Cell 4, it will print a block that looks like this:
```
============================================================

>>> COPY THIS TO YOUR TERMINAL <<<

export COLAB_API_URL=https://1234-56-78-90-12.ngrok-free.app

============================================================
```
Copy this export command and paste it into the terminal where you will run your SatQuery backend or test scripts.

*(Optional but recommended: Add your free Ngrok auth token in Cell 4 to avoid session timeouts).*

## 5. Testing the Server

You can test the server from your local machine using the provided script. The script loads the real M2 BigEarthNet sample, converts it to base64, and POSTs it to Colab.

```bash
# 1. Set the URL
export COLAB_API_URL=https://...ngrok-free.app

# 2. Run the test script
python scripts/test_colab_api.py
```

### Expected Latency
- **Model Load Time (Cell 2)**: ~2-3 minutes.
- **First Inference**: ~4-8 seconds (includes initialization overhead).
- **Subsequent Inferences**: ~2-4 seconds.

## 6. API Contract

**Endpoint**: `POST /analyze`

**Request Format (JSON)**:
```json
{
  "query": "Is there a building in this image?",
  "images": [
    "<base64_encoded_png_data>",
    "<base64_encoded_png_data>"
  ],
  "task_type": "SINGLE_IMAGE" // or "OPTICAL_SAR" or "BI_TEMPORAL"
}
```

**Response Format (JSON)**:
```json
{
  "answer": "Yes, there is a large building...",
  "model": "Qwen/Qwen2-VL-2B-Instruct"
}
```

## 7. Error Handling

The server returns standard HTTP errors instead of crashing:
* `400 Bad Request`: Missing query/images, or invalid base64 image data.
* `500 Internal Server Error`: GPU out of memory or inference crash.

## 8. Shutting Down & Restarting

* **To Stop**: Interrupt the execution of Cell 4, or select **Runtime > Disconnect and delete runtime**.
* **To Restart**: Select **Runtime > Restart session and run all**. The model will need to be reloaded.
