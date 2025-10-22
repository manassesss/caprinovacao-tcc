from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from app.core.db import get_session
from app.models.batch import Batch

router = APIRouter(prefix="/batches", tags=["batches"])

@router.get("/", response_model=List[Batch])
def list_batches(
    property_id: Optional[str] = None,
    skip: int = 0,
    limit: int = Query(50, le=200),
    session: Session = Depends(get_session),
):
    st = select(Batch)
    if property_id:
        st = st.where(Batch.property_id == property_id)
    return session.exec(st.offset(skip).limit(limit)).all()

@router.post("/", response_model=Batch, status_code=201)
def create_batch(batch: Batch, session: Session = Depends(get_session)):
    session.add(batch)
    session.commit()
    session.refresh(batch)
    return batch

@router.get("/{batch_id}", response_model=Batch)
def get_batch(batch_id: str, session: Session = Depends(get_session)):
    obj = session.get(Batch, batch_id)
    if not obj:
        raise HTTPException(404, "Batch not found")
    return obj

@router.patch("/{batch_id}", response_model=Batch)
def update_batch(batch_id: str, data: dict, session: Session = Depends(get_session)):
    obj = session.get(Batch, batch_id)
    if not obj:
        raise HTTPException(404, "Batch not found")
    for k, v in data.items():
        setattr(obj, k, v)
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return obj

@router.delete("/{batch_id}", status_code=204)
def delete_batch(batch_id: str, session: Session = Depends(get_session)):
    obj = session.get(Batch, batch_id)
    if not obj:
        raise HTTPException(404, "Batch not found")
    session.delete(obj)
    session.commit()
    return None

