import uuid
from fastapi import APIRouter, HTTPException
from ..schemas.call import PresignRequest, PresignResponse
from ..services.s3 import generate_presigned_url

router = APIRouter()

@router.post("/presign", response_model=PresignResponse)
async def get_presigned_url(request: PresignRequest):
    file_extension = request.filename.split(".")[-1] if "." in request.filename else ""
    s3_key = f"calls/{uuid.uuid4()}{'.' + file_extension if file_extension else ''}"
    
    upload_url = generate_presigned_url(s3_key, request.content_type)
    
    if not upload_url:
        raise HTTPException(status_code=500, detail="Could not generate presigned URL")
    
    return PresignResponse(upload_url=upload_url, s3_key=s3_key)

