from __future__ import annotations
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship
from .base import TimestampedModel

class Medicine(TimestampedModel, table=True):
    """Modelo de Medicamento"""
    __tablename__ = "medicines"
    id: str = Field(primary_key=True)
    name: str = Field(min_length=2, index=True)  # Nome do medicamento
    description: Optional[str] = None  # Descrição
    
    # Relationships - Comentados temporariamente
    # health_events: list["HealthEvent"] = Relationship(back_populates="medicine")

