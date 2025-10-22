from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from pydantic import BaseModel
import uuid
import time

from app.core.db import get_session
from app.core.auth import get_current_active_user
from app.models.user import User
from app.models.property import Property, ProfessionalRelationship

router = APIRouter(prefix="/properties", tags=["properties"])

# Schema de entrada (sem id)
class PropertyCreate(BaseModel):
    name: str
    cpf_cnpj: Optional[str] = None
    state_registration: Optional[str] = None
    state: str
    city: str
    address: Optional[str] = None
    cep: Optional[str] = None
    phone: Optional[str] = None
    area: Optional[float] = None

@router.get("/", response_model=List[Property])
def list_properties(
    skip: int = 0,
    limit: int = Query(50, le=200),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Lista propriedades/fazendas do usuário logado"""
    st = select(Property).where(Property.producer_id == current_user.id)
    return session.exec(st.offset(skip).limit(limit)).all()

@router.post("/", response_model=Property, status_code=201)
def create_property(
    property_data: PropertyCreate, 
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Cria uma nova propriedade/fazenda"""
    # Verifica CNPJ duplicado (se informado)
    if property_data.cpf_cnpj:
        existing = session.exec(select(Property).where(Property.cpf_cnpj == property_data.cpf_cnpj)).first()
        if existing:
            raise HTTPException(400, "CNPJ já cadastrado")
    
    # Gerar ID único
    timestamp = int(time.time() * 1000)
    unique_id = str(uuid.uuid4())[:8]
    property_id = f"farm_{timestamp}_{unique_id}"
    
    # Criar propriedade com ID gerado
    property = Property(
        **property_data.dict(),
        id=property_id,
        producer_id=current_user.id
    )
    
    session.add(property)
    session.commit()
    session.refresh(property)
    return property

@router.get("/{property_id}", response_model=Property)
def get_property(
    property_id: str,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Busca uma propriedade específica"""
    obj = session.get(Property, property_id)
    if not obj:
        raise HTTPException(404, "Propriedade não encontrada")
    
    # Verifica permissão
    if obj.producer_id != current_user.id and not current_user.is_admin:
        raise HTTPException(403, "Sem permissão para acessar esta propriedade")
    
    return obj

@router.put("/{property_id}", response_model=Property)
def update_property(
    property_id: str, 
    property_data: PropertyCreate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Atualiza uma propriedade"""
    obj = session.get(Property, property_id)
    if not obj:
        raise HTTPException(404, "Propriedade não encontrada")
    
    # Verifica permissão
    if obj.producer_id != current_user.id and not current_user.is_admin:
        raise HTTPException(403, "Sem permissão para editar esta propriedade")
    
    # Verifica CNPJ duplicado
    if property_data.cpf_cnpj and property_data.cpf_cnpj != obj.cpf_cnpj:
        existing = session.exec(select(Property).where(Property.cpf_cnpj == property_data.cpf_cnpj)).first()
        if existing:
            raise HTTPException(400, "CNPJ já cadastrado")
    
    # Atualiza campos
    update_data = property_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(obj, key, value)
    
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return obj

@router.delete("/{property_id}", status_code=204)
def delete_property(
    property_id: str,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Exclui uma propriedade"""
    obj = session.get(Property, property_id)
    if not obj:
        raise HTTPException(404, "Propriedade não encontrada")
    
    # Verifica permissão
    if obj.producer_id != current_user.id and not current_user.is_admin:
        raise HTTPException(403, "Sem permissão para excluir esta propriedade")
    
    session.delete(obj)
    session.commit()
    return None

# Professional Relationship endpoints
@router.post("/{property_id}/professionals", response_model=ProfessionalRelationship, status_code=201)
def add_professional(
    property_id: str,
    professional: ProfessionalRelationship,
    session: Session = Depends(get_session),
):
    professional.property_id = property_id
    session.add(professional)
    session.commit()
    session.refresh(professional)
    return professional

@router.get("/{property_id}/professionals", response_model=List[ProfessionalRelationship])
def list_professionals(property_id: str, session: Session = Depends(get_session)):
    st = select(ProfessionalRelationship).where(ProfessionalRelationship.property_id == property_id)
    return session.exec(st).all()

@router.patch("/{property_id}/professionals/{relationship_id}", response_model=ProfessionalRelationship)
def update_professional_relationship(
    property_id: str,
    relationship_id: int,
    data: dict,
    session: Session = Depends(get_session),
):
    st = select(ProfessionalRelationship).where(
        ProfessionalRelationship.id == relationship_id,
        ProfessionalRelationship.property_id == property_id
    )
    obj = session.exec(st).first()
    if not obj:
        raise HTTPException(404, "Professional relationship not found")
    
    for k, v in data.items():
        setattr(obj, k, v)
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return obj

