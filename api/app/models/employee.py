from __future__ import annotations
from typing import Optional
from sqlmodel import SQLModel, Field
from .base import TimestampedModel

class Employee(TimestampedModel, table=True):
    """Modelo de Funcionário vinculado a uma fazenda"""
    __tablename__ = "employees"
    
    id: str = Field(primary_key=True)
    property_id: str = Field(foreign_key="properties.id", index=True)  # Fazenda do funcionário
    
    # Dados pessoais
    name: str = Field(index=True)  # Nome do funcionário
    cpf: str = Field(unique=True)  # CPF (obrigatório e único)
    email: Optional[str] = Field(default=None, index=True)  # Email (opcional)
    phone: str  # Telefone
    address: Optional[str] = None  # Endereço
    city: Optional[str] = None  # Município
    state: Optional[str] = None  # Estado (opcional)
    
    # Dados da conta
    login: str = Field(unique=True, index=True)  # Login para acesso
    password: str  # Senha hash
    is_active: bool = True  # Status ativo/inativo


