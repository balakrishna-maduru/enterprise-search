from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from enum import Enum


class UserRole(str, Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    EMPLOYEE = "employee"
    EXECUTIVE = "executive"


class User(BaseModel):
    id: str
    name: str
    email: EmailStr
    department: str
    position: str
    role: UserRole
    company: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = {}


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    department: str
    position: str
    role: UserRole
    company: Optional[str] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    department: Optional[str] = None
    position: Optional[str] = None
    role: Optional[UserRole] = None
    company: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None