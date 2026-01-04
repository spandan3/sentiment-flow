import uuid
from fastapi import APIRouter, HTTPException, UploadFile, File
from pathlib import Path
from ..schemas.call import PresignRequest, PresignResponse
from ..services.storage import generate_upload_url, get_local_file_path, ensure_storage_directory, get_storage_mode

router = APIRouter()

@router.post("/presign", response_model=PresignResponse)
async def get_presigned_url(request: PresignRequest):
    """Generate upload URL - works with both S3 and local storage"""
    file_extension = request.filename.split(".")[-1] if "." in request.filename else ""
    s3_key = f"calls/{uuid.uuid4()}{'.' + file_extension if file_extension else ''}"
    
    upload_url = generate_upload_url(s3_key, request.content_type)
    
    if not upload_url:
        raise HTTPException(status_code=500, detail="Could not generate upload URL")
    
    return PresignResponse(upload_url=upload_url, s3_key=s3_key)

@router.post("/local/{s3_key:path}")
async def upload_local_file(s3_key: str, file: UploadFile = File(...)):
    """
    Direct file upload endpoint for local storage mode.
    This endpoint receives files when S3 is not configured.
    """
    try:
        # Ensure storage directory exists
        ensure_storage_directory()
        
        # Get local file path
        local_path = get_local_file_path(s3_key)
        if not local_path:
            raise HTTPException(status_code=500, detail="Local storage not configured")
        
        # Save file
        file_path = Path(local_path)
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        return {"status": "success", "s3_key": s3_key, "path": local_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

@router.get("/storage-mode")
async def get_storage_mode_endpoint():
    """Returns the current storage mode (local or s3)"""
    return {"mode": get_storage_mode()}

