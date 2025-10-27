from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select
from pydantic import BaseModel
import uuid
import time

from app.core.db import get_session
from app.core.auth import get_current_active_user
from app.core.optimizations import check_permission_optimized
from app.models.animal_control import AnimalMovement, ClinicalOccurrence, ParasiteControl, Vaccination, VaccinationAnimal
from app.models.user import User
from app.models.property import Property
from app.models.animal import Animal

# ============ SCHEMAS ============

# Movimentação Animal
class AnimalMovementCreate(BaseModel):
    property_id: str
    animal_id: int
    movement_date: date
    weight: Optional[float] = None
    exit_reason: str  # venda, morte, roubo, alimentacao, emprestimo
    observations: Optional[str] = None

# Ocorrência Clínica
class ClinicalOccurrenceCreate(BaseModel):
    property_id: str
    animal_id: int
    illness_id: str
    occurrence_date: date
    observations: Optional[str] = None

# Controle Parasitário
class ParasiteControlCreate(BaseModel):
    property_id: str
    animal_id: int
    medicine_id: str
    application_date: date
    opg_pre: Optional[int] = None
    opg_post: Optional[int] = None
    ecc: Optional[int] = None
    famacha: Optional[int] = None
    observations: Optional[str] = None

# Vacinação
class VaccinationCreate(BaseModel):
    property_id: str
    herd_id: Optional[str] = None
    medicine_id: str
    vaccination_date: date
    observations: Optional[str] = None
    is_batch: bool = False  # True se aplicado em lote
    animal_ids: Optional[List[int]] = []  # IDs dos animais vacinados

# ============ MOVIMENTAÇÃO ANIMAL ============

router_movement = APIRouter(prefix="/animal-movements", tags=["animal-movements"])

@router_movement.get("/", response_model=List[AnimalMovement])
def list_movements(
    property_id: Optional[str] = None,
    animal_id: Optional[int] = None,
    exit_reason: Optional[str] = None,
    skip: int = 0,
    limit: int = Query(50, le=200),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Lista movimentações de animais"""
    # Verifica permissão otimizada
    is_authorized, allowed_properties = check_permission_optimized(
        session, current_user, property_id
    )
    
    if not is_authorized:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    statement = select(AnimalMovement)
    
    # Aplica filtro de propriedades se necessário
    if allowed_properties:
        statement = statement.where(AnimalMovement.property_id.in_(allowed_properties))
    
    # Filtros adicionais
    if property_id:
        statement = statement.where(AnimalMovement.property_id == property_id)
    if animal_id:
        statement = statement.where(AnimalMovement.animal_id == animal_id)
    if exit_reason:
        statement = statement.where(AnimalMovement.exit_reason == exit_reason)
    
    return session.exec(statement.offset(skip).limit(limit)).all()

@router_movement.post("/", response_model=AnimalMovement, status_code=status.HTTP_201_CREATED)
def create_movement(
    movement_data: AnimalMovementCreate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Cria uma movimentação de animal"""
    # Verifica permissão
    prop = session.get(Property, movement_data.property_id)
    if not prop or (prop.producer_id != current_user.id and not current_user.is_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    # Verifica se animal existe
    animal = session.get(Animal, movement_data.animal_id)
    if not animal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Animal não encontrado")
    
    # Gerar ID
    timestamp = int(time.time() * 1000)
    unique_id = str(uuid.uuid4())[:8]
    movement_id = f"mov_{timestamp}_{unique_id}"
    
    movement = AnimalMovement(**movement_data.dict(), id=movement_id)
    
    session.add(movement)
    session.commit()
    session.refresh(movement)
    return movement

@router_movement.get("/{movement_id}", response_model=AnimalMovement)
def get_movement(
    movement_id: str,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Busca uma movimentação específica"""
    obj = session.get(AnimalMovement, movement_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movimentação não encontrada")
    
    prop = session.get(Property, obj.property_id)
    if not prop or (prop.producer_id != current_user.id and not current_user.is_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    return obj

@router_movement.delete("/{movement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_movement(
    movement_id: str,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Exclui uma movimentação"""
    obj = session.get(AnimalMovement, movement_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movimentação não encontrada")
    
    prop = session.get(Property, obj.property_id)
    if not prop or (prop.producer_id != current_user.id and not current_user.is_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    session.delete(obj)
    session.commit()
    return None


# ============ OCORRÊNCIA CLÍNICA ============

router_clinical = APIRouter(prefix="/clinical-occurrences", tags=["clinical-occurrences"])

@router_clinical.get("/", response_model=List[ClinicalOccurrence])
def list_occurrences(
    property_id: Optional[str] = None,
    animal_id: Optional[int] = None,
    illness_id: Optional[str] = None,
    skip: int = 0,
    limit: int = Query(50, le=200),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Lista ocorrências clínicas"""
    # Verifica permissão otimizada
    is_authorized, allowed_properties = check_permission_optimized(
        session, current_user, property_id
    )
    
    if not is_authorized:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    statement = select(ClinicalOccurrence)
    
    # Aplica filtro de propriedades se necessário
    if allowed_properties:
        statement = statement.where(ClinicalOccurrence.property_id.in_(allowed_properties))
    
    if property_id:
        statement = statement.where(ClinicalOccurrence.property_id == property_id)
    if animal_id:
        statement = statement.where(ClinicalOccurrence.animal_id == animal_id)
    if illness_id:
        statement = statement.where(ClinicalOccurrence.illness_id == illness_id)
    
    return session.exec(statement.offset(skip).limit(limit)).all()

@router_clinical.post("/", response_model=ClinicalOccurrence, status_code=status.HTTP_201_CREATED)
def create_occurrence(
    occurrence_data: ClinicalOccurrenceCreate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Cria uma ocorrência clínica"""
    # Verifica permissão
    prop = session.get(Property, occurrence_data.property_id)
    if not prop or (prop.producer_id != current_user.id and not current_user.is_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    # Gerar ID
    timestamp = int(time.time() * 1000)
    unique_id = str(uuid.uuid4())[:8]
    occurrence_id = f"occ_{timestamp}_{unique_id}"
    
    occurrence = ClinicalOccurrence(**occurrence_data.dict(), id=occurrence_id)
    
    session.add(occurrence)
    session.commit()
    session.refresh(occurrence)
    return occurrence

@router_clinical.delete("/{occurrence_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_occurrence(
    occurrence_id: str,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Exclui uma ocorrência clínica"""
    obj = session.get(ClinicalOccurrence, occurrence_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ocorrência não encontrada")
    
    prop = session.get(Property, obj.property_id)
    if not prop or (prop.producer_id != current_user.id and not current_user.is_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    session.delete(obj)
    session.commit()
    return None


# ============ CONTROLE PARASITÁRIO ============

router_parasite = APIRouter(prefix="/parasite-controls", tags=["parasite-controls"])

@router_parasite.get("/", response_model=List[ParasiteControl])
def list_parasite_controls(
    property_id: Optional[str] = None,
    animal_id: Optional[int] = None,
    skip: int = 0,
    limit: int = Query(50, le=200),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Lista controles parasitários"""
    # Verifica permissão otimizada
    is_authorized, allowed_properties = check_permission_optimized(
        session, current_user, property_id
    )
    
    if not is_authorized:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    statement = select(ParasiteControl)
    
    # Aplica filtro de propriedades se necessário
    if allowed_properties:
        statement = statement.where(ParasiteControl.property_id.in_(allowed_properties))
    
    if property_id:
        statement = statement.where(ParasiteControl.property_id == property_id)
    if animal_id:
        statement = statement.where(ParasiteControl.animal_id == animal_id)
    
    return session.exec(statement.offset(skip).limit(limit)).all()

@router_parasite.post("/", response_model=ParasiteControl, status_code=status.HTTP_201_CREATED)
def create_parasite_control(
    control_data: ParasiteControlCreate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Cria um registro de controle parasitário"""
    # Verifica permissão
    prop = session.get(Property, control_data.property_id)
    if not prop or (prop.producer_id != current_user.id and not current_user.is_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    # Gerar ID
    timestamp = int(time.time() * 1000)
    unique_id = str(uuid.uuid4())[:8]
    control_id = f"pc_{timestamp}_{unique_id}"
    
    control = ParasiteControl(**control_data.dict(), id=control_id)
    
    session.add(control)
    session.commit()
    session.refresh(control)
    return control

@router_parasite.delete("/{control_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_parasite_control(
    control_id: str,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Exclui um controle parasitário"""
    obj = session.get(ParasiteControl, control_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Controle não encontrado")
    
    prop = session.get(Property, obj.property_id)
    if not prop or (prop.producer_id != current_user.id and not current_user.is_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    session.delete(obj)
    session.commit()
    return None


# ============ VACINAÇÃO ============

router_vaccination = APIRouter(prefix="/vaccinations", tags=["vaccinations"])

@router_vaccination.get("/", response_model=List[Vaccination])
def list_vaccinations(
    property_id: Optional[str] = None,
    herd_id: Optional[str] = None,
    skip: int = 0,
    limit: int = Query(50, le=200),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Lista vacinações"""
    # Verifica permissão otimizada
    is_authorized, allowed_properties = check_permission_optimized(
        session, current_user, property_id
    )
    
    if not is_authorized:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    statement = select(Vaccination)
    
    # Aplica filtro de propriedades se necessário
    if allowed_properties:
        statement = statement.where(Vaccination.property_id.in_(allowed_properties))
    
    if property_id:
        statement = statement.where(Vaccination.property_id == property_id)
    if herd_id:
        statement = statement.where(Vaccination.herd_id == herd_id)
    
    return session.exec(statement.offset(skip).limit(limit)).all()

@router_vaccination.post("/", response_model=Vaccination, status_code=status.HTTP_201_CREATED)
def create_vaccination(
    vaccination_data: VaccinationCreate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Cria um registro de vacinação"""
    # Verifica permissão
    prop = session.get(Property, vaccination_data.property_id)
    if not prop or (prop.producer_id != current_user.id and not current_user.is_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    # Gerar ID
    timestamp = int(time.time() * 1000)
    unique_id = str(uuid.uuid4())[:8]
    vaccination_id = f"vac_{timestamp}_{unique_id}"
    
    # Criar vacinação
    vaccination = Vaccination(
        id=vaccination_id,
        property_id=vaccination_data.property_id,
        herd_id=vaccination_data.herd_id,
        medicine_id=vaccination_data.medicine_id,
        vaccination_date=vaccination_data.vaccination_date,
        observations=vaccination_data.observations,
        is_batch=vaccination_data.is_batch
    )
    
    session.add(vaccination)
    session.commit()
    session.refresh(vaccination)
    
    # Se tem animais, vincular
    if vaccination_data.animal_ids:
        for animal_id in vaccination_data.animal_ids:
            vac_animal = VaccinationAnimal(
                vaccination_id=vaccination_id,
                animal_id=animal_id
            )
            session.add(vac_animal)
        session.commit()
    
    return vaccination

@router_vaccination.get("/{vaccination_id}/animals", response_model=List[VaccinationAnimal])
def list_vaccination_animals(
    vaccination_id: str,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Lista animais de uma vacinação"""
    vaccination = session.get(Vaccination, vaccination_id)
    if not vaccination:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vacinação não encontrada")
    
    return session.exec(
        select(VaccinationAnimal).where(VaccinationAnimal.vaccination_id == vaccination_id)
    ).all()

@router_vaccination.delete("/{vaccination_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vaccination(
    vaccination_id: str,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Exclui uma vacinação"""
    obj = session.get(Vaccination, vaccination_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vacinação não encontrada")
    
    prop = session.get(Property, obj.property_id)
    if not prop or (prop.producer_id != current_user.id and not current_user.is_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    session.delete(obj)
    session.commit()
    return None

