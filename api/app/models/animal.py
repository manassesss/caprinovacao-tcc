from __future__ import annotations
from datetime import date
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship
from .base import TimestampedModel

class Animal(TimestampedModel, table=True):
    """Modelo de Animal - Identificação"""
    __tablename__ = "animals"
    id: int = Field(primary_key=True)
    property_id: str = Field(foreign_key="properties.id", index=True)
    herd_id: Optional[str] = Field(default=None, foreign_key="herd.id", index=True)  # Rebanho
    race_id: str = Field(foreign_key="races.id", index=True)
    
    # Identificação
    earring_identification: str = Field(unique=True)  # Número/identificação
    name: Optional[str] = None
    birth_date: date
    gender: str  # M ou F
    
    # Finalidade e Categoria
    objective: str  # producao, reproducao
    entry_reason: str  # compra, nascimento, emprestimo, outros
    category: str  # cabrito, borrego, marrão, matriz, reprodutor
    
    # Parto
    childbirth_type: str  # simples, duplo, triplo, quadruplo
    weaning_date: Optional[date] = None
    
    # Genealogia
    father_id: Optional[int] = Field(default=None, foreign_key="animals.id")
    mother_id: Optional[int] = Field(default=None, foreign_key="animals.id")
    father_race_id: Optional[str] = Field(default=None, foreign_key="races.id")  # Para mestiços
    mother_race_id: Optional[str] = Field(default=None, foreign_key="races.id")  # Para mestiços
    genetic_composition: str  # PO (puro de origem), PC (puro por cruza), mestiço
    
    # Características Morfológicas (Observações)
    testicular_degree: Optional[str] = None  # Grau de partição testicular (só para machos)
    ear_position: Optional[str] = None  # Posição da orelha
    has_beard: bool = False
    has_earring: bool = False
    has_horn: bool = False
    has_supranumerary_teats: bool = False
    
    # Status
    status: str = "ativo"  # ativo, vendido, morto, etc
    status_description: Optional[str] = None

    # Relationships - Comentados temporariamente
    # property: Property = Relationship(back_populates="animals", sa_relationship_kwargs={"lazy": "selectin"})
    # species: Species = Relationship(sa_relationship_kwargs={"lazy": "selectin"})
    # race: Race = Relationship(sa_relationship_kwargs={"lazy": "selectin"})
    # father: Animal = Relationship(sa_relationship_kwargs={"remote_side": "Animal.id", "lazy": "selectin"})
    # mother: Animal = Relationship(sa_relationship_kwargs={"remote_side": "Animal.id", "lazy": "selectin"})
    # batch: Batch = Relationship(back_populates="animals", sa_relationship_kwargs={"lazy": "selectin"})
    
    # Event relationships - Comentados temporariamente
    # weigh_in_events: list["WeighInEvent"] = Relationship(back_populates="animal")
    # reproductive_events: list["ReproductiveEvent"] = Relationship(back_populates="animal")
    # food_events: list["FoodEvent"] = Relationship(back_populates="animal")
    # movimentation_events: list["MovimentationEvent"] = Relationship(back_populates="animal")
    # health_events: list["HealthEvent"] = Relationship(back_populates="animal")
    # morphological_characteristics: list["MorphologicalCharacteristics"] = Relationship(back_populates="animal")
    # animal_herds: list["AnimalHerd"] = Relationship(back_populates="animal")
