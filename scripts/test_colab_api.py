import sys
import os
import time
import base64
import requests
import io
from pathlib import Path

# Need to import M2 preprocessing to get the REAL image
sys.path.insert(0, "D:/satquery-m2/src")
from m2.preprocessing import load_preprocessed_sample
from model_adapter.qwen2vl_adapter import build_s2_rgb, build_s1_rgb

def test_colab_server():
    colab_url = os.environ.get("COLAB_API_URL")
    if not colab_url:
        print("ERROR: Please set COLAB_API_URL environment variable first.")
        sys.exit(1)
        
    print(f"Targeting Colab API at: {colab_url}")
    
    sample_id = "BEN5P_S2B_MSIL2A_20180421T114349_N9999_R123_T29UPU_77_06"
    target_dir = "D:/satquery-m2/data/preprocessed"
    
    print(f"Loading real M2 sample: {sample_id}...")
    sample = load_preprocessed_sample(sample_id, target_dir=target_dir)
    
    s2_image = build_s2_rgb(sample.s2)
    s1_image = build_s1_rgb(sample.s1)
    
    # Convert to base64
    def img_to_b64(img):
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        return base64.b64encode(buffered.getvalue()).decode("utf-8")
        
    s2_b64 = img_to_b64(s2_image)
    s1_b64 = img_to_b64(s1_image)
    
    # Test 1: Single Image
    print("\n--- TEST 1: SINGLE IMAGE INFERENCE ---")
    question_1 = "Describe the visual scene shown in the satellite imagery."
    payload_1 = {
        "query": question_1,
        "images": [s2_b64],
        "task_type": "SINGLE_IMAGE"
    }
    
    start_time_1 = time.time()
    try:
        response_1 = requests.post(f"{colab_url.rstrip('/')}/analyze", json=payload_1, timeout=120.0)
        response_1.raise_for_status()
        data_1 = response_1.json()
        inf_time_1 = time.time() - start_time_1
        
        print(f"Status: Success ({response_1.status_code})")
        print(f"Time: {inf_time_1:.2f}s")
        print(f"Model: {data_1.get('model')}")
        print(f"Answer: {data_1.get('answer')}")
    except Exception as e:
        print(f"Test 1 Failed: {e}")
        if 'response_1' in locals() and hasattr(response_1, 'text'):
            print(response_1.text)
        sys.exit(1)

    # Test 2: Dual Image (Optical + SAR) without reloading model
    print("\n--- TEST 2: OPTICAL + SAR INFERENCE (NO RELOAD) ---")
    question_2 = "What types of land cover appear to be present based on the optical and SAR imagery?"
    payload_2 = {
        "query": question_2,
        "images": [s2_b64, s1_b64],
        "task_type": "OPTICAL_SAR"
    }
    
    start_time_2 = time.time()
    try:
        response_2 = requests.post(f"{colab_url.rstrip('/')}/analyze", json=payload_2, timeout=120.0)
        response_2.raise_for_status()
        data_2 = response_2.json()
        inf_time_2 = time.time() - start_time_2
        
        print(f"Status: Success ({response_2.status_code})")
        print(f"Time: {inf_time_2:.2f}s")
        print(f"Model: {data_2.get('model')}")
        print(f"Answer: {data_2.get('answer')}")
    except Exception as e:
        print(f"Test 2 Failed: {e}")
        if 'response_2' in locals() and hasattr(response_2, 'text'):
            print(response_2.text)

if __name__ == "__main__":
    test_colab_server()
