from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from app.core.db import get_session
from app.core.security import verify_token
from app.models.user import User

# Esquema de autenticação
security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
) -> User:
    """Obtém o usuário atual baseado no token JWT"""
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Verifica o token
    payload = verify_token(credentials.credentials)
    if payload is None:
        raise credentials_exception
    
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
    
    # Busca o usuário no banco
    statement = select(User).where(User.email == email)
    user = session.exec(statement).first()
    
    if user is None:
        raise credentials_exception
    
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Verifica se o usuário atual está ativo"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def get_admin_user(current_user: User = Depends(get_current_active_user)) -> User:
    """Verifica se o usuário atual é admin"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

async def get_producer_user(current_user: User = Depends(get_current_active_user)) -> User:
    """Verifica se o usuário atual é produtor ou admin"""
    if not (current_user.is_producer or current_user.is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions - Producer access required"
        )
    return current_user

async def get_technical_user(current_user: User = Depends(get_current_active_user)) -> User:
    """Verifica se o usuário atual é técnico, produtor ou admin"""
    if not (current_user.is_technical or current_user.is_producer or current_user.is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions - Technical access required"
        )
    return current_user
