from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import timedelta

from models.user import User
from middleware.auth import (
    create_access_token, get_current_user
)
from config import settings

router = APIRouter()


class LoginRequest(BaseModel):
    email: str
    # Optional user data that frontend can provide
    name: Optional[str] = None
    department: Optional[str] = None
    position: Optional[str] = None
    role: Optional[str] = "employee"
    company: Optional[str] = "Enterprise"


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: User


@router.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest) -> LoginResponse:
    """
    Authenticate user and return JWT token
    Accepts user data from frontend centralized user store
    """
    # Create user data from request (frontend provides user info)
    user_data = {
        "id": request.email.split("@")[0],  # Use email prefix as ID
        "name": request.name or "User",
        "email": request.email,
        "department": request.department or "Unknown",
        "position": request.position or "Employee",
        "role": request.role or "employee",
        "company": request.company or "Enterprise"
    }
    
    # Create access token with user data in payload
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token_data = {
        "sub": request.email,
        "user_id": user_data["id"],
        "name": user_data["name"],
        "department": user_data["department"],
        "position": user_data["position"],
        "role": user_data["role"],
        "company": user_data["company"]
    }
    access_token = create_access_token(
        data=token_data, 
        expires_delta=access_token_expires
    )
    
    user = User(**user_data)
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=user
    )


@router.get("/auth/me", response_model=User)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current authenticated user information
    """
    return current_user


@router.post("/auth/refresh")
async def refresh_token(
    current_user: User = Depends(get_current_user)
) -> Dict[str, str]:
    """
    Refresh the current user's token
    """
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token_data = {
        "sub": current_user.email,
        "user_id": current_user.id,
        "name": current_user.name,
        "department": current_user.department,
        "position": current_user.position,
        "role": current_user.role,
        "company": current_user.company
    }
    access_token = create_access_token(
        data=token_data, 
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }