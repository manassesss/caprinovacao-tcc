from __future__ import annotations
from datetime import date, datetime
from typing import Optional
from sqlmodel import SQLModel, Field
from .base import TimestampedModel

class WeighInEvent(TimestampedModel, table=True):
    __tablename__ = "weigh_in_event"
    id: int = Field(primary_key=True)
    manager_id: str = Field(foreign_key="users.id", index=True)
    animal_id: int = Field(foreign_key="animals.id", index=True)
    weight_kg: float
    origin_given: str = Field(description="MANUAL, PREDPESO")

class ReproductiveEvent(TimestampedModel, table=True):
    __tablename__ = "reproductive_event"
    id: int = Field(primary_key=True)
    manager_id: str = Field(foreign_key="users.id", index=True)
    animal_id: int = Field(foreign_key="animals.id", index=True)
    breeding_animal: Optional[int] = Field(default=None, foreign_key="animals.id")
    event_type: str = Field(description="COBERTURA, INSEMINACAO, DIAG_GESTACAO, PARTO")
    result_diag_gestation: Optional[str] = Field(description="POSITIVO, NEGATIVO")
    number_offspring: Optional[int] = None

class FoodEvent(TimestampedModel, table=True):
    __tablename__ = "food_events"
    id: int = Field(primary_key=True)
    manager_id: str = Field(foreign_key="users.id", index=True)
    animal_id: Optional[int] = Field(default=None, foreign_key="animals.id", index=True)
    batch_id: Optional[str] = Field(default=None, foreign_key="batches.id", index=True)
    type: str
    diet_description: str
    reason_for_exchange: Optional[str] = None

class MovimentationEvent(TimestampedModel, table=True):
    __tablename__ = "movimentation_events"
    id: int = Field(primary_key=True)
    manager_id: str = Field(foreign_key="users.id", index=True)
    animal_id: int = Field(foreign_key="animals.id", index=True)
    origin_batch_id: str = Field(foreign_key="batches.id", index=True)
    destination_batch_id: str = Field(foreign_key="batches.id", index=True)
    reason: str
    event_date: date

class HealthEvent(TimestampedModel, table=True):
    __tablename__ = "health_events"
    id: int = Field(primary_key=True)
    manager_id: str = Field(foreign_key="users.id", index=True)
    animal_id: int = Field(foreign_key="animals.id", index=True)
    medicine_id: Optional[str] = Field(default=None, foreign_key="medicines.id", index=True)
    event_date: date
    event_type: str
    famacha_score: Optional[int] = None

class SeasonYearEvent(TimestampedModel, table=True):
    __tablename__ = "season_year_events"
    id: int = Field(primary_key=True)
    manager_id: str = Field(foreign_key="users.id", index=True)
    property_id: str = Field(foreign_key="properties.id", index=True)
    season: str
    start_date: date
    end_date: date

class MorphologicalCharacteristics(TimestampedModel, table=True):
    __tablename__ = "morphological_characteristics"
    id: str = Field(primary_key=True)
    animal_id: int = Field(foreign_key="animals.id", index=True)
    testicular_participation: str
    ear_position: str = Field(default="N/A")
    has_beard: bool = Field(default=False)
    has_earring: bool = Field(default=False)
    has_horn: bool = Field(default=False)
    has_supranumerary: bool = Field(default=False)
