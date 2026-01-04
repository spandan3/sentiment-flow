import os
from typing import Optional
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Check if S3 is configured
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")

# Local storage configuration
LOCAL_STORAGE_PATH = os.getenv("LOCAL_STORAGE_PATH", "storage")
USE_LOCAL_STORAGE = not (AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY and S3_BUCKET_NAME)

def get_storage_mode():
    """Returns 'local' or 's3' based on configuration"""
    return "local" if USE_LOCAL_STORAGE else "s3"

def ensure_storage_directory():
    """Create storage directory if it doesn't exist"""
    if USE_LOCAL_STORAGE:
        storage_path = Path(LOCAL_STORAGE_PATH)
        storage_path.mkdir(parents=True, exist_ok=True)
        calls_path = storage_path / "calls"
        calls_path.mkdir(parents=True, exist_ok=True)
        return str(calls_path)
    return None

def get_local_file_path(s3_key: str) -> str:
    """Convert S3 key to local file path"""
    if USE_LOCAL_STORAGE:
        ensure_storage_directory()
        # s3_key format: "calls/uuid.ext"
        # Remove "calls/" prefix and use local storage
        filename = s3_key.replace("calls/", "")
        return str(Path(LOCAL_STORAGE_PATH) / "calls" / filename)
    return None

def generate_upload_url(s3_key: str, content_type: str) -> Optional[str]:
    """
    Generate upload URL - returns presigned S3 URL or local upload endpoint
    """
    if USE_LOCAL_STORAGE:
        # Return a local upload endpoint URL
        # The frontend will POST to this endpoint with the file
        return f"/api/uploads/local/{s3_key}"
    else:
        # Use S3 presigned URL (import here to avoid errors if boto3 not installed)
        try:
            from .s3 import generate_presigned_url
            return generate_presigned_url(s3_key, content_type)
        except Exception as e:
            print(f"Error generating S3 presigned URL: {e}")
            return None

