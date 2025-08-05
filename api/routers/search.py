from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from models.search import SearchRequest, SearchResponse
from services.elasticsearch_service import ElasticsearchService

router = APIRouter()


@router.post("/search", response_model=SearchResponse)
async def search_documents(
    request: SearchRequest
) -> SearchResponse:
    """
    Search for documents using Elasticsearch
    """
    try:
        elasticsearch_service = ElasticsearchService()
        result = await elasticsearch_service.search(request, None)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@router.get("/search/test-connection")
async def test_search_connection(
) -> Dict[str, Any]:
    """
    Test the Elasticsearch connection and return configuration status
    """
    try:
        elasticsearch_service = ElasticsearchService()
        status = await elasticsearch_service.test_connection()
        return {
            "status": "success",
            "connection_details": status
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Connection test failed: {str(e)}")