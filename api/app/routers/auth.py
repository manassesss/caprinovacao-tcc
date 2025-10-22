from datetime import timedelta
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.core.db import get_session
from app.core.security import authenticate_user, create_access_token, get_password_hash, ACCESS_TOKEN_EXPIRE_MINUTES
from app.core.auth import get_current_active_user
from app.models.auth import Token, UserLogin, UserRegister, UserResponse, UserUpdate
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/login", response_model=Token)
def login(user_credentials: UserLogin, session: Session = Depends(get_session)):
    """Login de usuário"""
    user = authenticate_user(user_credentials.email, user_credentials.password, session)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=UserResponse)
def register(user_data: UserRegister, session: Session = Depends(get_session)):
    """Registro de novo usuário"""
    
    try:
        # Verifica se email já existe
        statement = select(User).where(User.email == user_data.email)
        existing_user = session.exec(statement).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Verifica se CPF já existe
        statement = select(User).where(User.cpf == user_data.cpf)
        existing_cpf = session.exec(statement).first()
        if existing_cpf:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CPF already registered"
            )
        
        # Verifica se telefone já existe
        statement = select(User).where(User.phone == user_data.phone)
        existing_phone = session.exec(statement).first()
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone already registered"
            )
        
        # Cria novo usuário
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            id=f"user_{uuid.uuid4().hex[:8]}",  # ID único usando UUID
            name=user_data.name,
            email=user_data.email,
            password=hashed_password,
            cpf=user_data.cpf,
            phone=user_data.phone,
            is_admin=user_data.is_admin,
            is_producer=user_data.is_producer,
            is_coop_manager=user_data.is_coop_manager,
            is_technical=user_data.is_technical,
            council_number=user_data.council_number,
            is_gov=user_data.is_gov,
            is_active=True
        )
        
        session.add(db_user)
        session.commit()
        session.refresh(db_user)
        
        return db_user
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERRO NO REGISTRO: {str(e)}")
        print(f"Tipo: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )

@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """Retorna informações do usuário atual"""
    return current_user

@router.put("/me", response_model=UserResponse)
def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Atualiza informações do usuário atual"""
    
    # Verifica se email já existe em outro usuário
    if user_update.email and user_update.email != current_user.email:
        statement = select(User).where(User.email == user_update.email)
        existing_user = session.exec(statement).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Verifica se CPF já existe em outro usuário
    if user_update.cpf and user_update.cpf != current_user.cpf:
        statement = select(User).where(User.cpf == user_update.cpf)
        existing_cpf = session.exec(statement).first()
        if existing_cpf:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CPF already registered"
            )
    
    # Verifica se telefone já existe em outro usuário
    if user_update.phone and user_update.phone != current_user.phone:
        statement = select(User).where(User.phone == user_update.phone)
        existing_phone = session.exec(statement).first()
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone already registered"
            )
    
    # Atualiza apenas os campos fornecidos
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    
    return current_user

@router.post("/change-password")
def change_password(
    old_password: str,
    new_password: str,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Altera a senha do usuário atual"""
    from app.core.security import verify_password
    
    # Verifica senha atual
    if not verify_password(old_password, current_user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )
    
    # Atualiza senha
    current_user.password = get_password_hash(new_password)
    session.add(current_user)
    session.commit()
    
    return {"message": "Password updated successfully"}
