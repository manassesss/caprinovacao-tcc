from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select
from app.core.db import get_session
from app.core.auth import get_current_active_user
from app.models.illness import Illness
from app.models.user import User

router = APIRouter(prefix="/illnesses", tags=["illnesses"])

@router.get("/", response_model=List[Illness])
def list_illnesses(
    skip: int = 0,
    limit: int = Query(50, le=200),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Lista todas as doenças"""
    statement = select(Illness)
    return session.exec(statement.offset(skip).limit(limit)).all()

@router.post("/", response_model=Illness, status_code=status.HTTP_201_CREATED)
def create_illness(
    illness: Illness,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Cria uma nova doença"""
    # Verifica se já existe uma doença com esse nome
    existing = session.exec(select(Illness).where(Illness.name == illness.name)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Doença '{illness.name}' já existe"
        )
    
    # Gera ID único
    illness.id = f"illness_{uuid.uuid4().hex[:8]}"
    
    session.add(illness)
    session.commit()
    session.refresh(illness)
    return illness

@router.get("/{illness_id}", response_model=Illness)
def get_illness(
    illness_id: str,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Busca uma doença específica"""
    obj = session.get(Illness, illness_id)
    if not obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doença não encontrada"
        )
    return obj

@router.put("/{illness_id}", response_model=Illness)
def update_illness(
    illness_id: str,
    illness_update: Illness,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Atualiza uma doença"""
    obj = session.get(Illness, illness_id)
    if not obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doença não encontrada"
        )
    
    # Verifica se o novo nome já existe (se foi alterado)
    if illness_update.name != obj.name:
        existing = session.exec(select(Illness).where(Illness.name == illness_update.name)).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Doença '{illness_update.name}' já existe"
            )
    
    # Atualiza campos
    obj.name = illness_update.name
    obj.cause = illness_update.cause
    obj.prophylaxis = illness_update.prophylaxis
    obj.symptoms = illness_update.symptoms
    obj.treatment = illness_update.treatment
    
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return obj

@router.delete("/{illness_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_illness(
    illness_id: str,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Exclui uma doença"""
    obj = session.get(Illness, illness_id)
    if not obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doença não encontrada"
        )
    
    session.delete(obj)
    session.commit()
    return None

