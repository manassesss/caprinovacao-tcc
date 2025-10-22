from __future__ import annotations
from datetime import date
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from .base import TimestampedModel

class ReproductiveManagement(TimestampedModel, table=True):
    """Modelo de Manejo Reprodutivo"""
    __tablename__ = "reproductive_management"
    
    id: int = Field(primary_key=True)
    property_id: str = Field(foreign_key="properties.id", index=True)
    herd_id: Optional[str] = Field(default=None, foreign_key="herd.id", index=True)  # Rebanho
    
    # Matriz (fêmea)
    dam_id: int = Field(foreign_key="animals.id", index=True)  # Matriz (animal fêmea)
    coverage_date: date  # Data da cobertura
    dam_weight: float  # Peso da matriz (kg)
    dam_body_condition_score: int  # ECC da matriz (1-5)
    
    # Reprodutor (macho)
    sire_id: int = Field(foreign_key="animals.id", index=True)  # Reprodutor (animal macho)
    sire_scrotal_perimeter: Optional[float] = None  # Perímetro escrotal (cm)
    
    # Parição
    parturition_status: str  # sim, não, em_andamento
    birth_date: Optional[date] = None  # Data do parto
    childbirth_type: Optional[str] = None  # Tipo de parto (simples, duplo, triplo, quadruplo)
    weaning_date: Optional[date] = None  # Data do desmame
    
    # Observações
    observations: Optional[str] = None
    
    # Relationships (comentados por enquanto)
    # property: "Property" = Relationship()
    # herd: "Herd" = Relationship()
    # dam: "Animal" = Relationship(sa_relationship_kwargs={"foreign_keys": "ReproductiveManagement.dam_id"})
    # sire: "Animal" = Relationship(sa_relationship_kwargs={"foreign_keys": "ReproductiveManagement.sire_id"})
    # offspring: List["ReproductiveOffspring"] = Relationship(back_populates="reproductive_management")


class ReproductiveOffspring(TimestampedModel, table=True):
    """Filhos gerados em um manejo reprodutivo"""
    __tablename__ = "reproductive_offspring"
    
    id: int = Field(primary_key=True)
    reproductive_management_id: int = Field(foreign_key="reproductive_management.id", index=True)
    offspring_id: int = Field(foreign_key="animals.id", index=True)  # ID do filhote
    
    # Relationships
    # reproductive_management: "ReproductiveManagement" = Relationship(back_populates="offspring")
    # offspring: "Animal" = Relationship()

