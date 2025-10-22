from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from app.core.db import get_session
from app.models.taxonomy import Species, Race

router = APIRouter(prefix="/taxonomy", tags=["taxonomy"])

@router.get("/species", response_model=List[Species])
def list_species(session: Session = Depends(get_session)):
    return session.exec(select(Species)).all()

@router.post("/species", response_model=Species, status_code=201)
def create_species(sp: Species, session: Session = Depends(get_session)):
    session.add(sp)
    session.commit()
    session.refresh(sp)
    return sp

@router.get("/species/{species_id}", response_model=Species)
def get_species(species_id: str, session: Session = Depends(get_session)):
    obj = session.get(Species, species_id)
    if not obj:
        raise HTTPException(404, "Species not found")
    return obj

@router.get("/races", response_model=List[Race])
def list_races(
    species_id: Optional[str] = None,
    session: Session = Depends(get_session),
):
    st = select(Race)
    if species_id:
        st = st.where(Race.specie_id == species_id)
    return session.exec(st).all()

@router.post("/races", response_model=Race, status_code=201)
def create_race(race: Race, session: Session = Depends(get_session)):
    session.add(race)
    session.commit()
    session.refresh(race)
    return race

@router.get("/races/{race_id}", response_model=Race)
def get_race(race_id: str, session: Session = Depends(get_session)):
    obj = session.get(Race, race_id)
    if not obj:
        raise HTTPException(404, "Race not found")
    return obj
