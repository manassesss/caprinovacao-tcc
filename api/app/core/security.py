from datetime import datetime, timedelta
from typing import Optional, Union
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
import secrets

# Configuração de segurança
SECRET_KEY = secrets.token_urlsafe(32)  # Em produção, use uma chave fixa e segura
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Contexto para hash de senhas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica se a senha em texto plano corresponde ao hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Gera hash da senha"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Cria token JWT de acesso"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    """Verifica e decodifica o token JWT"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def authenticate_user(email: str, password: str, db_session) -> Optional[dict]:
    """Autentica usuário com email e senha"""
    from app.models.user import User
    from sqlmodel import select
    
    # Busca usuário por email
    statement = select(User).where(User.email == email)
    user = db_session.exec(statement).first()
    
    if not user:
        return None
    
    if not verify_password(password, user.password):
        return None
    
    if not user.is_active:
        return None
    
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "is_admin": user.is_admin,
        "is_producer": user.is_producer,
        "is_technical": user.is_technical,
        "is_coop_manager": user.is_coop_manager,
        "is_gov": user.is_gov
    }
