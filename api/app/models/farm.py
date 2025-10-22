from __future__ import annotations
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship
from .base import TimestampedModel

class Herd(TimestampedModel, table=True):
    """Modelo de Rebanho"""
    __tablename__ = "herd"
    id: str = Field(primary_key=True)
    property_id: str = Field(foreign_key="properties.id", index=True)
    name: str = Field(min_length=3)
    description: Optional[str] = None
    
    # Campos específicos de rebanho
    species: str = Field(description="Espécie: caprino, ovino ou ambos")
    feeding_management: str = Field(description="Tipo de manejo: extensivo, semi-intensivo ou intensivo")
    production_type: str = Field(description="Tipo de produção: carne, leite ou misto")
    
    # Relationships - Comentados temporariamente
    # property: "Property" = Relationship(back_populates="herds")
    # animal_herds: list["AnimalHerd"] = Relationship(back_populates="herd")

class AnimalHerd(TimestampedModel, table=True):
    __tablename__ = "animal_herd"
    id: str = Field(primary_key=True)
    animal_id: int = Field(foreign_key="animals.id", index=True)
    herd_id: str = Field(foreign_key="herd.id", index=True)
    
    # Relationships - Comentados temporariamente
    # animal: "Animal" = Relationship(back_populates="animal_herds")
    # herd: "Herd" = Relationship(back_populates="animal_herds")
