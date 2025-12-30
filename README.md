# Support Auditor - Phase 0

> 📖 **For detailed documentation, see [PHASE_0_REPORT.md](./PHASE_0_REPORT.md)**

## Project Structure
- `backend/`: FastAPI application
- `frontend/`: React + Vite + TypeScript application

## Backend Setup
1. `cd backend`
2. Create and activate virtual environment:
   ```bash
   python -m venv venv
   .\venv\Scripts\Activate.ps1  # Windows PowerShell
   # or: venv\Scripts\activate.bat  # Windows CMD
   # or: source venv/bin/activate  # Mac/Linux
   ```
3. Create a `.env` file with:
   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/support_auditor
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   AWS_REGION=us-east-1
   S3_BUCKET_NAME=your_bucket
   ```
3. `pip install -r requirements.txt`
4. Run migrations: `$env:PYTHONPATH="."; python -m alembic upgrade head`
5. Start server: `uvicorn app.main:app --reload`

## Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Phase 0 Features
- Health check: `GET /health`
- Presigned S3 URL generation: `POST /uploads/presign`
- Call metadata registration: `POST /calls`
- Call listing: `GET /calls`
- Frontend: Upload page and Calls list page

## Documentation
- **Quick Start:** This README
- **Detailed Report:** See [PHASE_0_REPORT.md](./PHASE_0_REPORT.md) for complete architecture, API documentation, and implementation details
