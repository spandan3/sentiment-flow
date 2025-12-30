from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..db.session import get_db
from ..models.call import Call
from ..schemas.call import CallCreate, CallRead

router = APIRouter()

@router.post("/", response_model=CallRead)
async def register_call(call_data: CallCreate, db: Session = Depends(get_db)):
    db_call = Call(
        s3_key=call_data.s3_key,
        original_filename=call_data.original_filename,
        status="uploaded"
    )
    db.add(db_call)
    db.commit()
    db.refresh(db_call)
    return db_call

@router.get("/", response_model=List[CallRead])
async def list_calls(db: Session = Depends(get_db)):
    calls = db.query(Call).order_by(Call.created_at.desc()).all()
    return calls

