from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from pydantic import BaseModel
from app.core.db import get_session
from app.core.auth import get_current_active_user
from app.core.security import get_password_hash
from app.models.employee import Employee
from app.models.user import User
from app.models.property import Property

router = APIRouter(prefix="/employees", tags=["employees"])

# Schema para criar funcionário
class EmployeeCreate(BaseModel):
    property_id: str
    name: str
    cpf: str
    email: Optional[str] = None
    phone: str
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    login: str
    password: str

# Schema para atualizar funcionário
class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    is_active: Optional[bool] = None

# Schema para resposta (sem senha)
class EmployeeResponse(BaseModel):
    id: str
    property_id: str
    name: str
    cpf: str
    email: Optional[str]
    phone: str
    address: Optional[str]
    city: Optional[str]
    state: Optional[str]
    login: str
    is_active: bool

@router.get("/", response_model=List[EmployeeResponse])
def list_employees(
    property_id: Optional[str] = None,
    skip: int = 0,
    limit: int = Query(50, le=200),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Lista funcionários das fazendas do usuário logado"""
    
    # Busca fazendas do usuário
    user_properties = session.exec(
        select(Property).where(Property.producer_id == current_user.id)
    ).all()
    property_ids = [p.id for p in user_properties]
    
    if not property_ids:
        return []
    
    # Filtra funcionários
    st = select(Employee).where(Employee.property_id.in_(property_ids))
    
    if property_id:
        st = st.where(Employee.property_id == property_id)
    
    return session.exec(st.offset(skip).limit(limit)).all()

@router.post("/", response_model=EmployeeResponse, status_code=201)
def create_employee(
    employee_data: EmployeeCreate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Cria um novo funcionário"""
    
    # Verifica se a fazenda pertence ao usuário
    property_obj = session.get(Property, employee_data.property_id)
    if not property_obj:
        raise HTTPException(404, "Fazenda não encontrada")
    
    if property_obj.producer_id != current_user.id and not current_user.is_admin:
        raise HTTPException(403, "Sem permissão para adicionar funcionário nesta fazenda")
    
    # Verifica se CPF já existe
    existing_cpf = session.exec(select(Employee).where(Employee.cpf == employee_data.cpf)).first()
    if existing_cpf:
        raise HTTPException(400, "CPF já cadastrado")
    
    # Verifica se login já existe
    existing_login = session.exec(select(Employee).where(Employee.login == employee_data.login)).first()
    if existing_login:
        raise HTTPException(400, "Login já cadastrado")
    
    # Verifica se email já existe (se informado)
    if employee_data.email:
        existing_email = session.exec(select(Employee).where(Employee.email == employee_data.email)).first()
        if existing_email:
            raise HTTPException(400, "Email já cadastrado")
    
    # Cria funcionário
    hashed_password = get_password_hash(employee_data.password)
    employee = Employee(
        id=f"emp_{uuid.uuid4().hex[:8]}",
        property_id=employee_data.property_id,
        name=employee_data.name,
        cpf=employee_data.cpf,
        email=employee_data.email,
        phone=employee_data.phone,
        address=employee_data.address,
        city=employee_data.city,
        state=employee_data.state,
        login=employee_data.login,
        password=hashed_password,
        is_active=True
    )
    
    session.add(employee)
    session.commit()
    session.refresh(employee)
    
    return employee

@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(
    employee_id: str,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Busca um funcionário específico"""
    employee = session.get(Employee, employee_id)
    if not employee:
        raise HTTPException(404, "Funcionário não encontrado")
    
    # Verifica se a fazenda do funcionário pertence ao usuário
    property_obj = session.get(Property, employee.property_id)
    if property_obj.producer_id != current_user.id and not current_user.is_admin:
        raise HTTPException(403, "Sem permissão para acessar este funcionário")
    
    return employee

@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    employee_id: str,
    employee_update: EmployeeUpdate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Atualiza dados de um funcionário"""
    employee = session.get(Employee, employee_id)
    if not employee:
        raise HTTPException(404, "Funcionário não encontrado")
    
    # Verifica permissão
    property_obj = session.get(Property, employee.property_id)
    if property_obj.producer_id != current_user.id and not current_user.is_admin:
        raise HTTPException(403, "Sem permissão para editar este funcionário")
    
    # Verifica email duplicado (se alterado)
    if employee_update.email and employee_update.email != employee.email:
        existing = session.exec(select(Employee).where(Employee.email == employee_update.email)).first()
        if existing:
            raise HTTPException(400, "Email já cadastrado")
    
    # Atualiza campos
    update_data = employee_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(employee, field, value)
    
    session.add(employee)
    session.commit()
    session.refresh(employee)
    
    return employee

@router.delete("/{employee_id}", status_code=204)
def delete_employee(
    employee_id: str,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Exclui um funcionário"""
    employee = session.get(Employee, employee_id)
    if not employee:
        raise HTTPException(404, "Funcionário não encontrado")
    
    # Verifica permissão
    property_obj = session.get(Property, employee.property_id)
    if property_obj.producer_id != current_user.id and not current_user.is_admin:
        raise HTTPException(403, "Sem permissão para excluir este funcionário")
    
    session.delete(employee)
    session.commit()
    return None

@router.post("/{employee_id}/change-password")
def change_employee_password(
    employee_id: str,
    new_password: str,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Altera a senha de um funcionário"""
    employee = session.get(Employee, employee_id)
    if not employee:
        raise HTTPException(404, "Funcionário não encontrado")
    
    # Verifica permissão
    property_obj = session.get(Property, employee.property_id)
    if property_obj.producer_id != current_user.id and not current_user.is_admin:
        raise HTTPException(403, "Sem permissão para alterar senha deste funcionário")
    
    # Atualiza senha
    employee.password = get_password_hash(new_password)
    session.add(employee)
    session.commit()
    
    return {"message": "Senha alterada com sucesso"}


