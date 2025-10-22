from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    cpf: str
    phone: str
    is_admin: bool = False
    is_producer: bool = False
    is_coop_manager: bool = False
    is_technical: bool = False
    council_number: Optional[str] = None
    is_gov: bool = False

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    cpf: str
    phone: str
    is_admin: bool
    is_producer: bool
    is_coop_manager: bool
    is_technical: bool
    council_number: Optional[str]
    is_gov: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    cpf: Optional[str] = None
    phone: Optional[str] = None
    is_admin: Optional[bool] = None
    is_producer: Optional[bool] = None
    is_coop_manager: Optional[bool] = None
    is_technical: Optional[bool] = None
    council_number: Optional[str] = None
    is_gov: Optional[bool] = None
    is_active: Optional[bool] = None
