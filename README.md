# SatQuery AI - SIH26167

Agentic Vision-Language Assistant for Remote-Sensing Analysis.

## Current Status
**Phase 6A - Model Handoff Preparation Completed**
The backend API, Next.js frontend, and agentic orchestration layer are completely decoupled from ML inference and are fully tested. 

**WAITING FOR TEAMMATE HANDOFF**: The system is waiting for ML Engineers to provide the real VQA, Grounding, Change-Detection, and Optical-SAR models according to the `docs/model-handoff-contract.md`. 
Currently, the system runs exclusively on TEST DOUBLES / MOCKS. No real AI inference or satellite data processing is happening yet.

## How to Start the Application

### Backend
1. Ensure Python 3.13 is installed.
2. Activate your virtual environment and install requirements:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
3. Run the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   The backend API runs at `http://localhost:8000`.

### Frontend
1. Ensure Node.js and npm are installed.
2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Set environment variables (create a `.env.local` if needed):
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
   The frontend runs at `http://localhost:3000`.
