from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from app.core.db import get_session
from app.core.auth import get_admin_user, get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/", response_model=List[User])
def list_users(
    q: Optional[str] = None,
    skip: int = 0,
    limit: int = Query(50, le=200),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_admin_user),  # Apenas admins podem listar usuários
):
    st = select(User)
    if q:
        st = st.where(User.name.ilike(f"%{q}%") | User.email.ilike(f"%{q}%"))
    return session.exec(st.offset(skip).limit(limit)).all()

@router.post("/", response_model=User, status_code=201)
def create_user(user: User, session: Session = Depends(get_session)):
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@router.get("/{user_id}", response_model=User)
def get_user(user_id: str, session: Session = Depends(get_session)):
    obj = session.get(User, user_id)
    if not obj:
        raise HTTPException(404, "User not found")
    return obj

@router.patch("/{user_id}", response_model=User)
def update_user(user_id: str, data: dict, session: Session = Depends(get_session)):
    obj = session.get(User, user_id)
    if not obj:
        raise HTTPException(404, "User not found")
    for k, v in data.items():
        setattr(obj, k, v)
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return obj

@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: str, session: Session = Depends(get_session)):
    obj = session.get(User, user_id)
    if not obj:
        raise HTTPException(404, "User not found")
    session.delete(obj)
    session.commit()
    return None

