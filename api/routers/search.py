from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any
from models.search import SearchRequest, SearchResponse
from models.user import User
from services.elasticsearch_service import ElasticsearchService
from middleware.auth import get_current_user

router = APIRouter()


@router.post("/search", response_model=SearchResponse)
async def search_documents(
    request: SearchRequest,
    current_user: User = Depends(get_current_user)
) -> SearchResponse:
    """
    Search for documents using Elasticsearch
    Requires user authentication to include user context in search
    """
    try:
        elasticsearch_service = ElasticsearchService()
        result = await elasticsearch_service.search(request, current_user)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@router.get("/search/test-connection")
async def test_search_connection(
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Test the Elasticsearch connection and return configuration status
    """
    try:
        elasticsearch_service = ElasticsearchService()
        status = await elasticsearch_service.test_connection()
        return {
            "status": "success",
            "connection_details": status,
            "user": {
                "id": current_user.id,
                "name": current_user.name,
                "department": current_user.department,
                "role": current_user.role.value
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Connection test failed: {str(e)}")