import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")

# Initialize S3 client only if credentials are available
s3_client = None
try:
    import boto3
    from botocore.config import Config
    
    if AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY and S3_BUCKET_NAME:
        s3_client = boto3.client(
            "s3",
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            region_name=AWS_REGION,
            config=Config(signature_version="s3v4")
        )
except ImportError:
    # boto3 not installed - that's okay, we'll use local storage
    pass

def generate_presigned_url(s3_key: str, content_type: str, expiration: int = 300) -> Optional[str]:
    """Generate a presigned URL to upload a file to S3"""
    if not s3_client:
        return None
    
    try:
        response = s3_client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": S3_BUCKET_NAME,
                "Key": s3_key,
                "ContentType": content_type
            },
            ExpiresIn=expiration,
        )
        return response
    except Exception as e:
        print(f"Error generating presigned URL: {e}")
        return None

