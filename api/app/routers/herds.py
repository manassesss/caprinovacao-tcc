from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select
from app.core.db import get_session
from app.core.auth import get_current_active_user
from app.models.farm import Herd
from app.models.user import User
from app.models.property import Property

router = APIRouter(prefix="/herds", tags=["herds"])

@router.get("/", response_model=List[Herd])
def list_herds(
    property_id: Optional[str] = None,
    skip: int = 0,
    limit: int = Query(50, le=200),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Lista rebanhos do usuário logado"""
    statement = select(Herd)
    
    if current_user.is_producer:
        # Produtor vê apenas rebanhos de suas fazendas
        producer_properties = session.exec(select(Property.id).where(Property.producer_id == current_user.id)).all()
        if not producer_properties:
            return []
        statement = statement.where(Herd.property_id.in_(producer_properties))
        
        # Se especificou property_id, verifica se pertence ao produtor
        if property_id:
            if property_id not in producer_properties:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this property's herds")
            statement = statement.where(Herd.property_id == property_id)
    elif current_user.is_admin:
        # Admin vê tudo, filtra por property_id se fornecido
        if property_id:
            statement = statement.where(Herd.property_id == property_id)
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to list herds")
    
    return session.exec(statement.offset(skip).limit(limit)).all()

@router.post("/", response_model=Herd, status_code=status.HTTP_201_CREATED)
def create_herd(
    herd: Herd,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Cria um novo rebanho"""
    # Verifica se o usuário tem permissão para criar rebanho nesta fazenda
    prop = session.get(Property, herd.property_id)
    if not prop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
    
    if not current_user.is_admin and prop.producer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to create herd for this property")
    
    # Valida os valores dos enums
    valid_species = ["caprino", "ovino", "ambos"]
    valid_feeding = ["extensivo", "semi-intensivo", "intensivo"]
    valid_production = ["carne", "leite", "misto"]
    
    if herd.species not in valid_species:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid species. Must be one of: {', '.join(valid_species)}")
    if herd.feeding_management not in valid_feeding:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid feeding management. Must be one of: {', '.join(valid_feeding)}")
    if herd.production_type not in valid_production:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid production type. Must be one of: {', '.join(valid_production)}")
    
    # Gera ID único
    herd.id = f"herd_{uuid.uuid4().hex[:8]}"
    
    session.add(herd)
    session.commit()
    session.refresh(herd)
    return herd

@router.get("/{herd_id}", response_model=Herd)
def get_herd(
    herd_id: str,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Busca um rebanho específico"""
    obj = session.get(Herd, herd_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Herd not found")
    
    # Verifica permissão
    prop = session.get(Property, obj.property_id)
    if not prop or (prop.producer_id != current_user.id and not current_user.is_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this herd")
    
    return obj

@router.put("/{herd_id}", response_model=Herd)
def update_herd(
    herd_id: str,
    herd_update: Herd,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Atualiza um rebanho"""
    obj = session.get(Herd, herd_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Herd not found")
    
    # Verifica permissão
    prop = session.get(Property, obj.property_id)
    if not prop or (prop.producer_id != current_user.id and not current_user.is_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this herd")
    
    # Valida os valores dos enums
    valid_species = ["caprino", "ovino", "ambos"]
    valid_feeding = ["extensivo", "semi-intensivo", "intensivo"]
    valid_production = ["carne", "leite", "misto"]
    
    if herd_update.species not in valid_species:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid species. Must be one of: {', '.join(valid_species)}")
    if herd_update.feeding_management not in valid_feeding:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid feeding management. Must be one of: {', '.join(valid_feeding)}")
    if herd_update.production_type not in valid_production:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid production type. Must be one of: {', '.join(valid_production)}")
    
    # Atualiza campos
    obj.name = herd_update.name
    obj.description = herd_update.description
    obj.species = herd_update.species
    obj.feeding_management = herd_update.feeding_management
    obj.production_type = herd_update.production_type
    
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return obj

@router.delete("/{herd_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_herd(
    herd_id: str,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Exclui um rebanho"""
    obj = session.get(Herd, herd_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Herd not found")
    
    # Verifica permissão
    prop = session.get(Property, obj.property_id)
    if not prop or (prop.producer_id != current_user.id and not current_user.is_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this herd")
    
    session.delete(obj)
    session.commit()
    return None

