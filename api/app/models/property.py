from __future__ import annotations
from typing import Optional

from sqlmodel import SQLModel, Field, Relationship
from .base import TimestampedModel

class Property(TimestampedModel, table=True):
    __tablename__ = "properties"
    id: str = Field(primary_key=True)
    producer_id: str = Field(foreign_key="users.id", index=True)
    name: str
    cpf_cnpj: Optional[str] = Field(default=None, unique=True)  # CNPJ agora opcional
    state_registration: Optional[str] = None  # Inscrição estadual opcional
    state: str
    city: str
    address: Optional[str] = None  # Endereço opcional
    cep: Optional[str] = None  # CEP opcional
    phone: Optional[str] = None  # Telefone
    area: Optional[float] = None  # Área em hectares
    
    # Relationships - Comentados temporariamente
    # producer: "User" = Relationship(back_populates="properties")
    # animals: list["Animal"] = Relationship(back_populates="property")
    # batches: list["Batch"] = Relationship(back_populates="property")
    # herds: list["Herd"] = Relationship(back_populates="property")
    # season_year_events: list["SeasonYearEvent"] = Relationship(back_populates="property")
    # professional_relationships: list["ProfessionalRelationship"] = Relationship(back_populates="property")

class ProfessionalRelationship(TimestampedModel, table=True):
    __tablename__ = "professional_relationship"
    id: int = Field(primary_key=True)
    property_id: str = Field(foreign_key="properties.id", index=True)
    professional_id: str = Field(foreign_key="users.id", index=True)
    permission: str = Field(description="reading, reading_writing")
    status: str = Field(description="pending, active, inactive")
    
    # Relationships - Comentados temporariamente
    # property: "Property" = Relationship(back_populates="professional_relationships")
    # professional: "User" = Relationship(back_populates="professional_relationships")

