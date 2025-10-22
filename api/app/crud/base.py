from typing import Generic, TypeVar, Type, Sequence, Optional
from sqlmodel import SQLModel, Session, select

ModelType = TypeVar("ModelType", bound=SQLModel)

class CRUDBase(Generic[ModelType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model

    def get(self, db: Session, id: int) -> Optional[ModelType]:
        return db.get(self.model, id)

    def list(self, db: Session, skip: int = 0, limit: int = 50) -> Sequence[ModelType]:
        return db.exec(select(self.model).offset(skip).limit(limit)).all()

    def create(self, db: Session, obj_in: ModelType) -> ModelType:
        db.add(obj_in)
        db.commit()
        db.refresh(obj_in)
        return obj_in

    def update(self, db: Session, db_obj: ModelType, obj_in: dict) -> ModelType:
        for k, v in obj_in.items():
            setattr(db_obj, k, v)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, id: int) -> None:
        obj = self.get(db, id)
        if obj:
            db.delete(obj)
            db.commit()
