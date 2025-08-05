from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import timedelta
from elasticsearch import Elasticsearch

from models.user import User
from middleware.auth import (
    create_access_token, get_current_user
)
from config import settings

router = APIRouter()


class LoginRequest(BaseModel):
    email: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: User


def get_es_client():
    """Get Elasticsearch client for employee validation"""
    try:
        es_url = settings.ELASTICSEARCH_URL or "http://localhost:9200"
        es = Elasticsearch([es_url])
        if not es.ping():
            raise Exception("Cannot connect to Elasticsearch")
        return es
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Elasticsearch connection failed: {str(e)}")


async def validate_user_email(email: str) -> Optional[Dict]:
    """Validate user email against Elasticsearch employee data"""
    try:
        es = get_es_client()
        
        # Search for employee by exact email match
        search_body = {
            "query": {
                "term": {
                    "email.keyword": email
                }
            },
            "size": 1
        }
        
        result = es.search(index="employees", body=search_body)
        
        if result['hits']['total']['value'] > 0:
            # Return the employee data
            return result['hits']['hits'][0]['_source']
        
        return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"User validation failed: {str(e)}")


@router.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest) -> LoginResponse:
    """
    Authenticate user with email-only login using Elasticsearch employee data
    """
    # Validate email against Elasticsearch
    employee_data = await validate_user_email(request.email)
    
    if not employee_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email not found in employee directory"
        )
    
    # Create user data from employee data
    user_data = {
        "id": employee_data.get("id", request.email.split("@")[0]),
        "name": employee_data.get("name", "Unknown User"),
        "email": employee_data.get("email", request.email),
        "department": employee_data.get("department", "Unknown"),
        "position": employee_data.get("title", "Employee"),  # title maps to position
        "role": "employee",  # Default role for now
        "company": "Enterprise"
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
        "company": user_data["company"],
        # Add additional employee data to token
        "employee_id": employee_data.get("id"),
        "location": employee_data.get("location"),
        "level": employee_data.get("level"),
        "manager_id": employee_data.get("manager_id"),
        "skills": employee_data.get("skills", []),
        "start_date": employee_data.get("start_date")
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