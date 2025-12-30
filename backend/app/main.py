from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import uploads, calls

app = FastAPI(title="Support Auditor API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, this should be restricted
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

app.include_router(uploads.router, prefix="/uploads", tags=["uploads"])
app.include_router(calls.router, prefix="/calls", tags=["calls"])

