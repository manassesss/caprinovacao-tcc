from __future__ import annotations
from datetime import date
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship
from .base import TimestampedModel

class AnimalMovement(TimestampedModel, table=True):
    """Movimentação Animal - Saídas do rebanho"""
    __tablename__ = "animal_movements"
    
    id: str = Field(primary_key=True)
    property_id: str = Field(foreign_key="properties.id", index=True)
    animal_id: int = Field(foreign_key="animals.id", index=True)
    
    movement_date: date  # Data da movimentação
    weight: Optional[float] = None  # Peso no momento da saída
    exit_reason: str  # venda, morte, roubo, alimentacao, emprestimo
    observations: Optional[str] = None
    
    # Relationships
    # property: "Property" = Relationship()
    # animal: "Animal" = Relationship()


class ClinicalOccurrence(TimestampedModel, table=True):
    """Ocorrência Clínica - Registro de doenças"""
    __tablename__ = "clinical_occurrences"
    
    id: str = Field(primary_key=True)
    property_id: str = Field(foreign_key="properties.id", index=True)
    animal_id: int = Field(foreign_key="animals.id", index=True)
    illness_id: str = Field(foreign_key="illnesses.id", index=True)
    
    occurrence_date: date  # Data da ocorrência
    observations: Optional[str] = None
    
    # Relationships
    # property: "Property" = Relationship()
    # animal: "Animal" = Relationship()
    # illness: "Illness" = Relationship()


class ParasiteControl(TimestampedModel, table=True):
    """Controle Parasitário - Vermifugação"""
    __tablename__ = "parasite_controls"
    
    id: str = Field(primary_key=True)
    property_id: str = Field(foreign_key="properties.id", index=True)
    animal_id: int = Field(foreign_key="animals.id", index=True)
    medicine_id: str = Field(foreign_key="medicines.id", index=True)  # Anti-helmíntico
    
    application_date: date  # Data da vermifugação
    opg_pre: Optional[int] = None  # OPG pré-tratamento
    opg_post: Optional[int] = None  # OPG pós-tratamento (14-21 dias depois)
    ecc: Optional[int] = None  # Escore de condição corporal (1-5)
    famacha: Optional[int] = None  # FAMACHA (1-5)
    observations: Optional[str] = None
    
    # Relationships
    # property: "Property" = Relationship()
    # animal: "Animal" = Relationship()
    # medicine: "Medicine" = Relationship()


class Vaccination(TimestampedModel, table=True):
    """Vacinação - Individual ou em lote"""
    __tablename__ = "vaccinations"
    
    id: str = Field(primary_key=True)
    property_id: str = Field(foreign_key="properties.id", index=True)
    herd_id: Optional[str] = Field(default=None, foreign_key="herd.id", index=True)  # Lote por rebanho
    medicine_id: str = Field(foreign_key="medicines.id", index=True)  # Vacina
    
    vaccination_date: date  # Data da vacinação
    observations: Optional[str] = None
    is_batch: bool = False  # True se foi aplicado em lote (rebanho inteiro)
    
    # Relationships
    # property: "Property" = Relationship()
    # herd: "Herd" = Relationship()
    # medicine: "Medicine" = Relationship()
    # animals: List["VaccinationAnimal"] = Relationship(back_populates="vaccination")


class VaccinationAnimal(TimestampedModel, table=True):
    """Relação entre vacinação e animais vacinados"""
    __tablename__ = "vaccination_animals"
    
    id: int = Field(primary_key=True)
    vaccination_id: str = Field(foreign_key="vaccinations.id", index=True)
    animal_id: int = Field(foreign_key="animals.id", index=True)
    
    # Relationships
    # vaccination: "Vaccination" = Relationship(back_populates="animals")
    # animal: "Animal" = Relationship()

