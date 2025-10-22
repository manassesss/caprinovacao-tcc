from __future__ import annotations
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship
from .base import TimestampedModel

class Illness(TimestampedModel, table=True):
    """Modelo de Doença"""
    __tablename__ = "illnesses"
    id: str = Field(primary_key=True)
    name: str = Field(min_length=2, index=True)  # Nome da doença
    cause: Optional[str] = None  # Causa
    prophylaxis: Optional[str] = None  # Profilaxia
    symptoms: Optional[str] = None  # Sintomas
    treatment: Optional[str] = None  # Tratamento
    
    # Relationships - Comentados temporariamente
    # health_events: list["HealthEvent"] = Relationship(back_populates="illness")

