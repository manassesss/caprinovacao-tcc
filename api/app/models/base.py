from datetime import datetime
from typing import Optional, Optional
from sqlmodel import SQLModel, Field

class TimestampedModel(SQLModel):
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow, nullable=False)
