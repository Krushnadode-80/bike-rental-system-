from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):

    name: str

    email: EmailStr

    password: str

    role: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

from typing import Optional

class UserProfileUpdate(BaseModel):
    name: str
    aadhaar_number: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None

    class Config:
        extra = "ignore"

class UserProfileResponse(BaseModel):
    name: str
    email: str
    aadhaar_number: str = None
    address: str = None
    is_complete: bool
