from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any
from services.elasticsearch_service import ElasticsearchService
from services.llm_service import LLMService
from middleware.auth import get_current_user
from models.user import User

router = APIRouter()

class SummaryRequestInput(BaseModel):
    index: str
    docId: str

class SummaryResponseEnvelope(BaseModel):
    code: int
    msg: str
    data: str

@router.post("/summary", response_model=SummaryResponseEnvelope)
async def summarize_document(
    request: SummaryRequestInput,
    current_user: User = Depends(get_current_user)
) -> SummaryResponseEnvelope:
    """
    Summarize a document by index and docId, returning { code, msg, data }
    """
    try:
        es_service = ElasticsearchService()
        # Fetch the document by index and docId
        async with es_service._get_headers() as headers:
            # Use httpx directly for a single doc fetch
            import httpx
            url = f"{es_service.endpoint}/{request.index}/_doc/{request.docId}"
            async with httpx.AsyncClient() as client:
                resp = await client.get(url, headers=headers)
                if resp.status_code != 200:
                    return SummaryResponseEnvelope(code=404, msg="Document not found", data="")
                doc = resp.json()['_source']
        # Prepare a fake SearchResult for LLMService
        from models.search import SearchResult
        search_result = SearchResult(
            id=request.docId,
            title=doc.get('title', 'Untitled'),
            summary=doc.get('summary', doc.get('content', '')[:200]),
            source=doc.get('source', 'unknown'),
            url=doc.get('url', '#'),
            author=doc.get('author', 'Unknown'),
            date=doc.get('timestamp', 'Unknown'),
            content_type=doc.get('content_type', 'document'),
            tags=doc.get('tags', []),
            relevance_score=100,
            highlights={},
            content=doc.get('content', doc.get('summary', ''))
        )
        llm_service = LLMService()
        # Use the LLM to summarize this single document
        from models.llm import SummaryRequest
        summary_req = SummaryRequest(query=f"Summarize document {doc.get('title', '')}", search_results=[search_result])
        summary_resp = await llm_service.generate_summary(summary_req, current_user)
        return SummaryResponseEnvelope(code=0, msg="success", data=summary_resp.summary)
    except Exception as e:
        return SummaryResponseEnvelope(code=500, msg=f"Summary failed: {str(e)}", data="")
