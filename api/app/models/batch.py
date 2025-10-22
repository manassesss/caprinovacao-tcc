from __future__ import annotations
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship
from .base import TimestampedModel

class Batch(TimestampedModel, table=True):
    __tablename__ = "batches"
    id: str = Field(primary_key=True)
    property_id: str = Field(foreign_key="properties.id", index=True)
    name: str
    description: Optional[str] = None
    
    # Relationships - Comentados temporariamente
    # property: "Property" = Relationship(back_populates="batches")
    # animals: list["Animal"] = Relationship(back_populates="batch")
    # food_events: list["FoodEvent"] = Relationship(back_populates="batch")
    # movimentation_events_origin: list["MovimentationEvent"] = Relationship(
    #     back_populates="origin_batch",
    #     sa_relationship_kwargs={"foreign_keys": "MovimentationEvent.origin_batch_id"}
    # )
    # movimentation_events_destination: list["MovimentationEvent"] = Relationship(
    #     back_populates="destination_batch",
    #     sa_relationship_kwargs={"foreign_keys": "MovimentationEvent.destination_batch_id"}
    # )

