from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select
from pydantic import BaseModel
from app.core.db import get_session
from app.core.auth import get_current_active_user
from app.models.reproductive_management import ReproductiveManagement, ReproductiveOffspring
from app.models.user import User
from app.models.property import Property
from app.models.animal import Animal

router = APIRouter(prefix="/reproductive-management", tags=["reproductive-management"])

# ============ SCHEMAS ============

class ReproductiveManagementCreate(BaseModel):
    property_id: str
    herd_id: Optional[str] = None
    dam_id: int  # Matriz (fêmea)
    coverage_date: date  # Data da cobertura
    dam_weight: float  # Peso da matriz
    dam_body_condition_score: int  # ECC da matriz
    sire_id: int  # Reprodutor (macho)
    sire_scrotal_perimeter: Optional[float] = None  # Perímetro escrotal
    parturition_status: str  # sim, não, em_andamento
    birth_date: Optional[date] = None  # Data do parto
    childbirth_type: Optional[str] = None  # Tipo de parto
    weaning_date: Optional[date] = None  # Data do desmame
    observations: Optional[str] = None

class OffspringCreate(BaseModel):
    offspring_id: int  # ID do filhote

# ============ CRUD DE MANEJO REPRODUTIVO ============

@router.get("/", response_model=List[ReproductiveManagement])
def list_reproductive_management(
    q: Optional[str] = None,
    property_id: Optional[str] = None,
    herd_id: Optional[str] = None,
    dam_id: Optional[int] = None,
    sire_id: Optional[int] = None,
    parturition_status: Optional[str] = None,
    skip: int = 0,
    limit: int = Query(50, le=200),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Lista manejos reprodutivos do usuário"""
    statement = select(ReproductiveManagement)
    
    if current_user.is_producer:
        # Produtor vê apenas de suas fazendas
        producer_properties = session.exec(select(Property.id).where(Property.producer_id == current_user.id)).all()
        if not producer_properties:
            return []
        statement = statement.where(ReproductiveManagement.property_id.in_(producer_properties))
    elif not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    if property_id:
        statement = statement.where(ReproductiveManagement.property_id == property_id)
    if herd_id:
        statement = statement.where(ReproductiveManagement.herd_id == herd_id)
    if dam_id:
        statement = statement.where(ReproductiveManagement.dam_id == dam_id)
    if sire_id:
        statement = statement.where(ReproductiveManagement.sire_id == sire_id)
    if parturition_status:
        statement = statement.where(ReproductiveManagement.parturition_status == parturition_status)
    
    return session.exec(statement.offset(skip).limit(limit)).all()

@router.post("/", response_model=ReproductiveManagement, status_code=status.HTTP_201_CREATED)
def create_reproductive_management(
    management_data: ReproductiveManagementCreate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Cria um novo registro de manejo reprodutivo"""
    # Verifica permissão
    prop = session.get(Property, management_data.property_id)
    if not prop or (prop.producer_id != current_user.id and not current_user.is_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    # Validações
    # Verifica se a matriz é fêmea
    dam = session.get(Animal, management_data.dam_id)
    if not dam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Matriz não encontrada")
    if dam.gender != "F":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Matriz deve ser um animal fêmea")
    
    # Verifica se o reprodutor é macho
    sire = session.get(Animal, management_data.sire_id)
    if not sire:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reprodutor não encontrado")
    if sire.gender != "M":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reprodutor deve ser um animal macho")
    
    # Validação: se parição = não ou em_andamento, não pode ter dados de parto
    if management_data.parturition_status in ("não", "em_andamento"):
        if management_data.birth_date or management_data.childbirth_type or management_data.weaning_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Não pode informar dados de parto se parição = não/em andamento"
            )
    
    # Criar registro
    management = ReproductiveManagement(**management_data.dict())
    
    session.add(management)
    session.commit()
    session.refresh(management)
    return management

@router.get("/{management_id}", response_model=ReproductiveManagement)
def get_reproductive_management(
    management_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Busca um manejo reprodutivo específico"""
    obj = session.get(ReproductiveManagement, management_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Manejo reprodutivo not found")
    
    # Verifica permissão
    prop = session.get(Property, obj.property_id)
    if not prop or (prop.producer_id != current_user.id and not current_user.is_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    return obj

@router.put("/{management_id}", response_model=ReproductiveManagement)
def update_reproductive_management(
    management_id: int,
    management_data: ReproductiveManagementCreate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Atualiza um manejo reprodutivo"""
    obj = session.get(ReproductiveManagement, management_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Manejo reprodutivo not found")
    
    # Verifica permissão
    prop = session.get(Property, obj.property_id)
    if not prop or (prop.producer_id != current_user.id and not current_user.is_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    # Validações
    if management_data.parturition_status in ("não", "em_andamento"):
        if management_data.birth_date or management_data.childbirth_type or management_data.weaning_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Não pode informar dados de parto se parição = não/em andamento"
            )
    
    # Atualizar campos
    update_data = management_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(obj, key, value)
    
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return obj

@router.delete("/{management_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reproductive_management(
    management_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Exclui um manejo reprodutivo"""
    obj = session.get(ReproductiveManagement, management_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Manejo reprodutivo not found")
    
    # Verifica permissão
    prop = session.get(Property, obj.property_id)
    if not prop or (prop.producer_id != current_user.id and not current_user.is_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    session.delete(obj)
    session.commit()
    return None


# ============ FILHOS (OFFSPRING) ============

@router.get("/{management_id}/offspring", response_model=List[ReproductiveOffspring])
def list_offspring(
    management_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Lista filhos de um manejo reprodutivo"""
    management = session.get(ReproductiveManagement, management_id)
    if not management:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Manejo reprodutivo not found")
    
    return session.exec(
        select(ReproductiveOffspring).where(ReproductiveOffspring.reproductive_management_id == management_id)
    ).all()

@router.post("/{management_id}/offspring", response_model=ReproductiveOffspring, status_code=status.HTTP_201_CREATED)
def add_offspring(
    management_id: int,
    offspring_data: OffspringCreate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Adiciona um filhote ao manejo reprodutivo"""
    management = session.get(ReproductiveManagement, management_id)
    if not management:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Manejo reprodutivo not found")
    
    # Verifica se o animal existe
    offspring = session.get(Animal, offspring_data.offspring_id)
    if not offspring:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Animal não encontrado")
    
    # Cria registro
    offspring_record = ReproductiveOffspring(
        reproductive_management_id=management_id,
        offspring_id=offspring_data.offspring_id
    )
    
    session.add(offspring_record)
    session.commit()
    session.refresh(offspring_record)
    return offspring_record

@router.delete("/{management_id}/offspring/{offspring_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_offspring(
    management_id: int,
    offspring_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Remove um filhote do manejo reprodutivo"""
    offspring_record = session.exec(
        select(ReproductiveOffspring).where(
            ReproductiveOffspring.reproductive_management_id == management_id,
            ReproductiveOffspring.offspring_id == offspring_id
        )
    ).first()
    
    if not offspring_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offspring not found")
    
    session.delete(offspring_record)
    session.commit()
    return None

