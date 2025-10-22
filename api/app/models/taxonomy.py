from __future__ import annotations
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship
from .base import TimestampedModel

class Species(TimestampedModel, table=True):
    __tablename__ = "species"
    id: str = Field(primary_key=True)
    specie_name: str = Field(index=True, unique=True)

    # races: list["Race"] = Relationship(back_populates="species")
    # animals: list["Animal"] = Relationship(back_populates="species")
    # herds: list["Herd"] = Relationship(back_populates="species")

class Race(TimestampedModel, table=True):
    """Modelo de Raça"""
    __tablename__ = "races"
    id: str = Field(primary_key=True)
    name: str = Field(index=True, min_length=2)  # Nome da raça
    origin: Optional[str] = None  # Origem da raça
    general_aspects: Optional[str] = None  # Aspectos gerais / descrição

    # species: "Species" = Relationship(back_populates="races")
    # animals: list["Animal"] = Relationship(back_populates="race")
