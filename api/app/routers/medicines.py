from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select
from app.core.db import get_session
from app.core.auth import get_current_active_user
from app.models.medicine import Medicine
from app.models.user import User

router = APIRouter(prefix="/medicines", tags=["medicines"])

@router.get("/", response_model=List[Medicine])
def list_medicines(
    skip: int = 0,
    limit: int = Query(50, le=200),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Lista todos os medicamentos"""
    statement = select(Medicine)
    return session.exec(statement.offset(skip).limit(limit)).all()

@router.post("/", response_model=Medicine, status_code=status.HTTP_201_CREATED)
def create_medicine(
    medicine: Medicine,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Cria um novo medicamento"""
    # Verifica se já existe um medicamento com esse nome
    existing = session.exec(select(Medicine).where(Medicine.name == medicine.name)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Medicamento '{medicine.name}' já existe"
        )
    
    # Gera ID único
    medicine.id = f"medicine_{uuid.uuid4().hex[:8]}"
    
    session.add(medicine)
    session.commit()
    session.refresh(medicine)
    return medicine

@router.get("/{medicine_id}", response_model=Medicine)
def get_medicine(
    medicine_id: str,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Busca um medicamento específico"""
    obj = session.get(Medicine, medicine_id)
    if not obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medicamento não encontrado"
        )
    return obj

@router.put("/{medicine_id}", response_model=Medicine)
def update_medicine(
    medicine_id: str,
    medicine_update: Medicine,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Atualiza um medicamento"""
    obj = session.get(Medicine, medicine_id)
    if not obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medicamento não encontrado"
        )
    
    # Verifica se o novo nome já existe (se foi alterado)
    if medicine_update.name != obj.name:
        existing = session.exec(select(Medicine).where(Medicine.name == medicine_update.name)).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Medicamento '{medicine_update.name}' já existe"
            )
    
    # Atualiza campos
    obj.name = medicine_update.name
    obj.description = medicine_update.description
    
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return obj

@router.delete("/{medicine_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_medicine(
    medicine_id: str,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Exclui um medicamento"""
    obj = session.get(Medicine, medicine_id)
    if not obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medicamento não encontrado"
        )
    
    session.delete(obj)
    session.commit()
    return None
