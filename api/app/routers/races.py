from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select
from app.core.db import get_session
from app.core.auth import get_current_active_user
from app.models.taxonomy import Race
from app.models.user import User

router = APIRouter(prefix="/races", tags=["races"])

@router.get("/", response_model=List[Race])
def list_races(
    skip: int = 0,
    limit: int = Query(50, le=200),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Lista todas as raças"""
    statement = select(Race)
    return session.exec(statement.offset(skip).limit(limit)).all()

@router.post("/", response_model=Race, status_code=status.HTTP_201_CREATED)
def create_race(
    race: Race,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Cria uma nova raça"""
    # Verifica se já existe uma raça com esse nome
    existing = session.exec(select(Race).where(Race.name == race.name)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Raça '{race.name}' já existe"
        )
    
    # Gera ID único
    race.id = f"race_{uuid.uuid4().hex[:8]}"
    
    session.add(race)
    session.commit()
    session.refresh(race)
    return race

@router.get("/{race_id}", response_model=Race)
def get_race(
    race_id: str,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Busca uma raça específica"""
    obj = session.get(Race, race_id)
    if not obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Raça não encontrada"
        )
    return obj

@router.put("/{race_id}", response_model=Race)
def update_race(
    race_id: str,
    race_update: Race,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Atualiza uma raça"""
    obj = session.get(Race, race_id)
    if not obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Raça não encontrada"
        )
    
    # Verifica se o novo nome já existe (se foi alterado)
    if race_update.name != obj.name:
        existing = session.exec(select(Race).where(Race.name == race_update.name)).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Raça '{race_update.name}' já existe"
            )
    
    # Atualiza campos
    obj.name = race_update.name
    obj.origin = race_update.origin
    obj.general_aspects = race_update.general_aspects
    
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return obj

@router.delete("/{race_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_race(
    race_id: str,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Exclui uma raça"""
    obj = session.get(Race, race_id)
    if not obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Raça não encontrada"
        )
    
    session.delete(obj)
    session.commit()
    return None

