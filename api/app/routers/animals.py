from typing import List, Optional
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select
from pydantic import BaseModel, validator
from app.core.db import get_session
from app.core.auth import get_current_active_user
from app.core.optimizations import check_permission_optimized
from app.models.animal import Animal
from app.models.animal_measurements import WeightRecord, ParasiteRecord, BodyMeasurement, CarcassMeasurement
from app.models.user import User
from app.models.property import Property

router = APIRouter(prefix="/animals", tags=["animals"])

# ============ SCHEMAS DE ENTRADA ============

# Schema para criação/atualização de animais
class AnimalCreate(BaseModel):
    property_id: str
    herd_id: Optional[str] = None
    race_id: str
    earring_identification: str
    name: Optional[str] = None
    birth_date: date  # Tipo date, aceita string e converte
    gender: str
    objective: str
    entry_reason: str
    category: str
    childbirth_type: str
    weaning_date: Optional[date] = None  # Tipo date, aceita string e converte
    father_id: Optional[int] = None
    mother_id: Optional[int] = None
    father_race_id: Optional[str] = None
    mother_race_id: Optional[str] = None
    genetic_composition: str
    testicular_degree: Optional[str] = None
    ear_position: Optional[str] = None
    has_beard: bool = False
    has_earring: bool = False
    has_horn: bool = False
    has_supranumerary_teats: bool = False
    status: str = "ativo"
    status_description: Optional[str] = None

    class Config:
        json_encoders = {
            date: lambda v: v.strftime('%Y-%m-%d') if v else None
        }

# Schema para criar peso (sem animal_id)
class WeightRecordCreate(BaseModel):
    measurement_date: Optional[date] = None  # Data da medição (usa data atual se não informado)
    measurement_period: str
    weight: Optional[float] = None
    body_condition_score: Optional[int] = None  # ECC
    conformation: Optional[int] = None  # C
    precocity: Optional[int] = None  # P
    musculature: Optional[int] = None  # M

# Schema para criar registro de parasitas
class ParasiteRecordCreate(BaseModel):
    record_date: Optional[date] = None  # Data da medição (usa data atual se não informado)
    opg: Optional[int] = None
    famacha: Optional[int] = None  # FAMACHA 1-5

# Schema para criar medidas corporais
class BodyMeasurementCreate(BaseModel):
    measurement_date: Optional[date] = None  # Data da medição (usa data atual se não informado)
    ag: Optional[float] = None
    ac: Optional[float] = None
    ap: Optional[float] = None
    cc: Optional[float] = None
    pc: Optional[float] = None
    perpe: Optional[float] = None
    cpern: Optional[float] = None
    co: Optional[float] = None
    ct: Optional[float] = None
    lr: Optional[float] = None
    ccab: Optional[float] = None
    lil: Optional[float] = None
    lis: Optional[float] = None
    ccau: Optional[float] = None
    cga: Optional[float] = None
    pcau: Optional[float] = None

# Schema para criar medidas de carcaça
class CarcassMeasurementCreate(BaseModel):
    measurement_date: Optional[date] = None  # Data da medição (usa data atual se não informado)
    aol: Optional[float] = None
    col: Optional[float] = None
    pol: Optional[float] = None
    mol: Optional[float] = None
    egs: Optional[float] = None
    egbf: Optional[float] = None
    ege: Optional[float] = None

# ============ CRUD DE ANIMAIS ============

@router.get("/", response_model=List[Animal])
def list_animals(
    q: Optional[str] = None,
    property_id: Optional[str] = None,
    herd_id: Optional[str] = None,
    skip: int = 0,
    limit: int = Query(50, le=200),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Lista animais do usuário logado"""
    # Verifica permissão otimizada
    is_authorized, allowed_properties = check_permission_optimized(
        session, current_user, property_id
    )
    
    if not is_authorized:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    statement = select(Animal)
    
    # Aplica filtro de propriedades se necessário
    if allowed_properties:
        statement = statement.where(Animal.property_id.in_(allowed_properties))
    
    # Filtros de busca
    if q:
        statement = statement.where(
            (Animal.earring_identification.ilike(f"%{q}%")) | 
            (Animal.name.ilike(f"%{q}%"))
        )
    if property_id:
        statement = statement.where(Animal.property_id == property_id)
    if herd_id:
        statement = statement.where(Animal.herd_id == herd_id)
    
    return session.exec(statement.offset(skip).limit(limit)).all()

@router.post("/", response_model=Animal, status_code=status.HTTP_201_CREATED)
def create_animal(
    animal_data: AnimalCreate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Cria um novo animal"""
    # Verifica permissão
    prop = session.get(Property, animal_data.property_id)
    if not prop or (prop.producer_id != current_user.id and not current_user.is_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    # Validações
    if animal_data.gender not in ("M", "F"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Gender must be 'M' or 'F'")
    
    # Verifica identificação única
    existing = session.exec(select(Animal).where(Animal.earring_identification == animal_data.earring_identification)).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Earring identification already exists")
    
    # Validação: se mestiço, deve ter raça do pai e da mãe
    if animal_data.genetic_composition == "mestiço":
        if not animal_data.father_race_id or not animal_data.mother_race_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Para mestiço, informe raça do pai e da mãe")
    
    # Validação: grau testicular só para machos
    if animal_data.gender == "F" and animal_data.testicular_degree:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Grau testicular não se aplica a fêmeas")
    
    # Criar o objeto Animal com os dados convertidos
    animal = Animal(**animal_data.dict())
    
    session.add(animal)
    session.commit()
    session.refresh(animal)
    return animal

@router.get("/{animal_id}", response_model=Animal)
def get_animal(
    animal_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Busca um animal específico"""
    obj = session.get(Animal, animal_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Animal not found")
    
    # Verifica permissão
    prop = session.get(Property, obj.property_id)
    if not prop or (prop.producer_id != current_user.id and not current_user.is_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    return obj

@router.put("/{animal_id}", response_model=Animal)
def update_animal(
    animal_id: int,
    animal_data: AnimalCreate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Atualiza um animal"""
    obj = session.get(Animal, animal_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Animal not found")
    
    # Verifica permissão
    prop = session.get(Property, obj.property_id)
    if not prop or (prop.producer_id != current_user.id and not current_user.is_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    # Validações
    if animal_data.gender not in ("M", "F"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Gender must be 'M' or 'F'")
    
    if animal_data.genetic_composition == "mestiço":
        if not animal_data.father_race_id or not animal_data.mother_race_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Para mestiço, informe raça do pai e da mãe")
    
    if animal_data.gender == "F" and animal_data.testicular_degree:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Grau testicular não se aplica a fêmeas")
    
    # Atualiza campos
    update_data = animal_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(obj, key, value)
    
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return obj

@router.delete("/{animal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_animal(
    animal_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Exclui um animal"""
    obj = session.get(Animal, animal_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Animal not found")
    
    # Verifica permissão
    prop = session.get(Property, obj.property_id)
    if not prop or (prop.producer_id != current_user.id and not current_user.is_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    session.delete(obj)
    session.commit()
    return None


# ============ DESENVOLVIMENTO PONDERAL (PESO) ============

@router.get("/{animal_id}/weights", response_model=List[WeightRecord])
def list_weight_records(
    animal_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Lista registros de peso de um animal"""
    animal = session.get(Animal, animal_id)
    if not animal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Animal not found")
    
    return session.exec(select(WeightRecord).where(WeightRecord.animal_id == animal_id)).all()

@router.post("/{animal_id}/weights", response_model=WeightRecord, status_code=status.HTTP_201_CREATED)
def create_weight_record(
    animal_id: int,
    weight_data: WeightRecordCreate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Cria um registro de peso"""
    animal = session.get(Animal, animal_id)
    if not animal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Animal not found")
    
    # Preparar dados com data atual se não informada
    data_dict = weight_data.dict()
    if not data_dict.get('measurement_date'):
        data_dict['measurement_date'] = date.today()
    
    # Criar o registro com animal_id
    weight_record = WeightRecord(**data_dict, animal_id=animal_id)
    
    # Calcula média CPM se tiver C, P e M
    if weight_record.conformation and weight_record.precocity and weight_record.musculature:
        weight_record.cpm_average = (weight_record.conformation + weight_record.precocity + weight_record.musculature) / 3
    
    session.add(weight_record)
    session.commit()
    session.refresh(weight_record)
    return weight_record


# ============ VERMINOSE ============

@router.get("/{animal_id}/parasites", response_model=List[ParasiteRecord])
def list_parasite_records(
    animal_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Lista registros de verminose de um animal"""
    animal = session.get(Animal, animal_id)
    if not animal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Animal not found")
    
    return session.exec(select(ParasiteRecord).where(ParasiteRecord.animal_id == animal_id)).all()

@router.post("/{animal_id}/parasites", response_model=ParasiteRecord, status_code=status.HTTP_201_CREATED)
def create_parasite_record(
    animal_id: int,
    parasite_data: ParasiteRecordCreate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Cria um registro de verminose"""
    animal = session.get(Animal, animal_id)
    if not animal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Animal not found")
    
    # Preparar dados com data atual se não informada
    data_dict = parasite_data.dict()
    if not data_dict.get('record_date'):
        data_dict['record_date'] = date.today()
    
    # Criar o registro com animal_id
    parasite_record = ParasiteRecord(**data_dict, animal_id=animal_id)
    
    session.add(parasite_record)
    session.commit()
    session.refresh(parasite_record)
    return parasite_record


# ============ MEDIDAS CORPORAIS ============

@router.get("/{animal_id}/body-measurements", response_model=List[BodyMeasurement])
def list_body_measurements(
    animal_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Lista medidas corporais de um animal"""
    animal = session.get(Animal, animal_id)
    if not animal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Animal not found")
    
    return session.exec(select(BodyMeasurement).where(BodyMeasurement.animal_id == animal_id)).all()

@router.post("/{animal_id}/body-measurements", response_model=BodyMeasurement, status_code=status.HTTP_201_CREATED)
def create_body_measurement(
    animal_id: int,
    body_data: BodyMeasurementCreate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Cria um registro de medidas corporais"""
    animal = session.get(Animal, animal_id)
    if not animal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Animal not found")
    
    # Preparar dados com data atual se não informada
    data_dict = body_data.dict()
    if not data_dict.get('measurement_date'):
        data_dict['measurement_date'] = date.today()
    
    # Criar o registro com animal_id
    body_measurement = BodyMeasurement(**data_dict, animal_id=animal_id)
    
    session.add(body_measurement)
    session.commit()
    session.refresh(body_measurement)
    return body_measurement


# ============ MEDIDAS DE CARCAÇA ============

@router.get("/{animal_id}/carcass-measurements", response_model=List[CarcassMeasurement])
def list_carcass_measurements(
    animal_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Lista medidas de carcaça de um animal"""
    animal = session.get(Animal, animal_id)
    if not animal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Animal not found")
    
    return session.exec(select(CarcassMeasurement).where(CarcassMeasurement.animal_id == animal_id)).all()

@router.post("/{animal_id}/carcass-measurements", response_model=CarcassMeasurement, status_code=status.HTTP_201_CREATED)
def create_carcass_measurement(
    animal_id: int,
    carcass_data: CarcassMeasurementCreate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Cria um registro de medidas de carcaça"""
    animal = session.get(Animal, animal_id)
    if not animal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Animal not found")
    
    # Preparar dados com data atual se não informada
    data_dict = carcass_data.dict()
    if not data_dict.get('measurement_date'):
        data_dict['measurement_date'] = date.today()
    
    # Criar o registro com animal_id
    carcass_measurement = CarcassMeasurement(**data_dict, animal_id=animal_id)
    
    session.add(carcass_measurement)
    session.commit()
    session.refresh(carcass_measurement)
    return carcass_measurement
