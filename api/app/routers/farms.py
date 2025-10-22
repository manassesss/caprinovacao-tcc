from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from app.core.db import get_session
from app.models.farm import Herd, AnimalHerd

router = APIRouter(prefix="/herds", tags=["herds"])

@router.get("/", response_model=List[Herd])
def list_herds(
    property_id: Optional[str] = None,
    species_id: Optional[str] = None,
    skip: int = 0,
    limit: int = Query(50, le=200),
    session: Session = Depends(get_session),
):
    st = select(Herd)
    if property_id:
        st = st.where(Herd.property_id == property_id)
    if species_id:
        st = st.where(Herd.specie_id == species_id)
    return session.exec(st.offset(skip).limit(limit)).all()

@router.post("/", response_model=Herd, status_code=201)
def create_herd(herd: Herd, session: Session = Depends(get_session)):
    session.add(herd)
    session.commit()
    session.refresh(herd)
    return herd

@router.get("/{herd_id}", response_model=Herd)
def get_herd(herd_id: str, session: Session = Depends(get_session)):
    obj = session.get(Herd, herd_id)
    if not obj:
        raise HTTPException(404, "Herd not found")
    return obj

@router.patch("/{herd_id}", response_model=Herd)
def update_herd(herd_id: str, data: dict, session: Session = Depends(get_session)):
    obj = session.get(Herd, herd_id)
    if not obj:
        raise HTTPException(404, "Herd not found")
    for k, v in data.items():
        setattr(obj, k, v)
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return obj

@router.delete("/{herd_id}", status_code=204)
def delete_herd(herd_id: str, session: Session = Depends(get_session)):
    obj = session.get(Herd, herd_id)
    if not obj:
        raise HTTPException(404, "Herd not found")
    session.delete(obj)
    session.commit()
    return None

# Animal-Herd relationship endpoints
@router.post("/{herd_id}/animals", response_model=AnimalHerd, status_code=201)
def add_animal_to_herd(
    herd_id: str,
    animal_herd: AnimalHerd,
    session: Session = Depends(get_session),
):
    animal_herd.herd_id = herd_id
    session.add(animal_herd)
    session.commit()
    session.refresh(animal_herd)
    return animal_herd

@router.get("/{herd_id}/animals", response_model=List[AnimalHerd])
def list_herd_animals(herd_id: str, session: Session = Depends(get_session)):
    st = select(AnimalHerd).where(AnimalHerd.herd_id == herd_id)
    return session.exec(st).all()

@router.delete("/{herd_id}/animals/{animal_id}", status_code=204)
def remove_animal_from_herd(herd_id: str, animal_id: int, session: Session = Depends(get_session)):
    st = select(AnimalHerd).where(
        AnimalHerd.herd_id == herd_id,
        AnimalHerd.animal_id == animal_id
    )
    obj = session.exec(st).first()
    if not obj:
        raise HTTPException(404, "Animal-herd relationship not found")
    session.delete(obj)
    session.commit()
    return None
