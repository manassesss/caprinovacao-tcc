from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from app.core.db import get_session
from app.models.events import (
    WeighInEvent,
    ReproductiveEvent,
    FoodEvent,
    MovimentationEvent,
    HealthEvent,
    SeasonYearEvent,
    MorphologicalCharacteristics
)

router = APIRouter(prefix="/events", tags=["events"])

# Weigh In Events
@router.post("/weigh-in", response_model=WeighInEvent, status_code=201)
def create_weigh_in(e: WeighInEvent, session: Session = Depends(get_session)):
    session.add(e)
    session.commit()
    session.refresh(e)
    return e

@router.get("/weigh-in", response_model=List[WeighInEvent])
def list_weigh_in(
    animal_id: Optional[int] = None,
    manager_id: Optional[str] = None,
    session: Session = Depends(get_session),
):
    st = select(WeighInEvent)
    if animal_id:
        st = st.where(WeighInEvent.animal_id == animal_id)
    if manager_id:
        st = st.where(WeighInEvent.manager_id == manager_id)
    return session.exec(st).all()

# Reproductive Events
@router.post("/reproductive", response_model=ReproductiveEvent, status_code=201)
def create_reproductive(e: ReproductiveEvent, session: Session = Depends(get_session)):
    session.add(e)
    session.commit()
    session.refresh(e)
    return e

@router.get("/reproductive", response_model=List[ReproductiveEvent])
def list_reproductive(
    animal_id: Optional[int] = None,
    manager_id: Optional[str] = None,
    session: Session = Depends(get_session),
):
    st = select(ReproductiveEvent)
    if animal_id:
        st = st.where(ReproductiveEvent.animal_id == animal_id)
    if manager_id:
        st = st.where(ReproductiveEvent.manager_id == manager_id)
    return session.exec(st).all()

# Food Events
@router.post("/food", response_model=FoodEvent, status_code=201)
def create_food(e: FoodEvent, session: Session = Depends(get_session)):
    session.add(e)
    session.commit()
    session.refresh(e)
    return e

@router.get("/food", response_model=List[FoodEvent])
def list_food(
    animal_id: Optional[int] = None,
    batch_id: Optional[str] = None,
    manager_id: Optional[str] = None,
    session: Session = Depends(get_session),
):
    st = select(FoodEvent)
    if animal_id:
        st = st.where(FoodEvent.animal_id == animal_id)
    if batch_id:
        st = st.where(FoodEvent.batch_id == batch_id)
    if manager_id:
        st = st.where(FoodEvent.manager_id == manager_id)
    return session.exec(st).all()

# Movimentation Events
@router.post("/movimentation", response_model=MovimentationEvent, status_code=201)
def create_movimentation(e: MovimentationEvent, session: Session = Depends(get_session)):
    session.add(e)
    session.commit()
    session.refresh(e)
    return e

@router.get("/movimentation", response_model=List[MovimentationEvent])
def list_movimentation(
    animal_id: Optional[int] = None,
    manager_id: Optional[str] = None,
    session: Session = Depends(get_session),
):
    st = select(MovimentationEvent)
    if animal_id:
        st = st.where(MovimentationEvent.animal_id == animal_id)
    if manager_id:
        st = st.where(MovimentationEvent.manager_id == manager_id)
    return session.exec(st).all()

# Health Events
@router.post("/health", response_model=HealthEvent, status_code=201)
def create_health(e: HealthEvent, session: Session = Depends(get_session)):
    session.add(e)
    session.commit()
    session.refresh(e)
    return e

@router.get("/health", response_model=List[HealthEvent])
def list_health(
    animal_id: Optional[int] = None,
    manager_id: Optional[str] = None,
    session: Session = Depends(get_session),
):
    st = select(HealthEvent)
    if animal_id:
        st = st.where(HealthEvent.animal_id == animal_id)
    if manager_id:
        st = st.where(HealthEvent.manager_id == manager_id)
    return session.exec(st).all()

# Season Year Events
@router.post("/season-year", response_model=SeasonYearEvent, status_code=201)
def create_season_year(e: SeasonYearEvent, session: Session = Depends(get_session)):
    session.add(e)
    session.commit()
    session.refresh(e)
    return e

@router.get("/season-year", response_model=List[SeasonYearEvent])
def list_season_year(
    property_id: Optional[str] = None,
    manager_id: Optional[str] = None,
    session: Session = Depends(get_session),
):
    st = select(SeasonYearEvent)
    if property_id:
        st = st.where(SeasonYearEvent.property_id == property_id)
    if manager_id:
        st = st.where(SeasonYearEvent.manager_id == manager_id)
    return session.exec(st).all()

# Morphological Characteristics
@router.post("/morphology", response_model=MorphologicalCharacteristics, status_code=201)
def create_morphology(m: MorphologicalCharacteristics, session: Session = Depends(get_session)):
    session.add(m)
    session.commit()
    session.refresh(m)
    return m

@router.get("/morphology", response_model=List[MorphologicalCharacteristics])
def list_morphology(animal_id: Optional[int] = None, session: Session = Depends(get_session)):
    st = select(MorphologicalCharacteristics)
    if animal_id:
        st = st.where(MorphologicalCharacteristics.animal_id == animal_id)
    return session.exec(st).all()

@router.get("/morphology/{morphology_id}", response_model=MorphologicalCharacteristics)
def get_morphology(morphology_id: str, session: Session = Depends(get_session)):
    obj = session.get(MorphologicalCharacteristics, morphology_id)
    if not obj:
        raise HTTPException(404, "Morphological characteristics not found")
    return obj
