from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from typing import Dict, List
from datetime import timedelta

from models.user import User
from middleware.auth import (
    create_access_token, MOCK_USERS, get_current_user
)
from config import settings

router = APIRouter()


class LoginRequest(BaseModel):
    email: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: User


class UserListResponse(BaseModel):
    users: List[User]


@router.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest) -> LoginResponse:
    """
    Authenticate user and return JWT token
    In development, accepts any email from the mock user list
    """
    user_data = MOCK_USERS.get(request.email)
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": request.email}, 
        expires_delta=access_token_expires
    )
    
    user = User(**user_data)
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=user
    )


@router.get("/auth/users", response_model=UserListResponse)
async def get_available_users() -> UserListResponse:
    """
    Get list of available users for development/demo purposes
    In production, this would be restricted to admin users only
    """
    users = [User(**user_data) for user_data in MOCK_USERS.values()]
    return UserListResponse(users=users)


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
    access_token = create_access_token(
        data={"sub": current_user.email}, 
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }