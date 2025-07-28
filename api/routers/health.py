from fastapi import APIRouter, Depends
from typing import Dict, Any
from services.elasticsearch_service import ElasticsearchService
from models.user import User
from middleware.auth import get_optional_user

router = APIRouter()


@router.get("/health")
async def health_check() -> Dict[str, str]:
    """Basic health check endpoint"""
    return {"status": "healthy", "service": "enterprise-search-api"}


@router.get("/health/elasticsearch")
async def elasticsearch_health(
    current_user: User = Depends(get_optional_user)
) -> Dict[str, Any]:
    """Check Elasticsearch connection and configuration"""
    elasticsearch_service = ElasticsearchService()
    
    try:
        status = await elasticsearch_service.test_connection()
        return {
            "status": "connected",
            "details": status,
            "user_authenticated": current_user is not None
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "user_authenticated": current_user is not None
        }