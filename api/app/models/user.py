from __future__ import annotations
from typing import Optional

from sqlmodel import SQLModel, Field, Relationship
from .base import TimestampedModel

class User(TimestampedModel, table=True):
    __tablename__ = "users"
    id: str = Field(primary_key=True)
    name: str
    email: str = Field(index=True, unique=True)
    password: str
    cpf: str = Field(unique=True)
    phone: str = Field(unique=True)
    is_admin: bool = False
    is_producer: bool = False
    is_coop_manager: bool = False
    is_technical: bool = False
    council_number: Optional[str] = None
    is_gov: bool = False
    is_active: bool = True
    
    # Relationships - Comentados temporariamente para resolver problema de import circular
    # properties: list["Property"] = Relationship(back_populates="producer")
    # professional_relationships: list["ProfessionalRelationship"] = Relationship(back_populates="professional")
