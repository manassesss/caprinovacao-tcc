from sqlmodel import SQLModel, create_engine, Session
from .config import get_settings

settings = get_settings()
engine = create_engine(settings.DATABASE_URL, echo=(settings.APP_ENV == "dev"))

def init_db() -> None:
    from app.models import (  # noqa: F401 (import side-effects)
        base,
        user,
        property,
        animal,
        batch,
        taxonomy,
        farm,
        medicine,
        events,
    )
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
