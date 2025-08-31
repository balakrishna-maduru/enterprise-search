from fastapi import APIRouter, Depends, HTTPException, Request
from typing import Dict, Any
import json
from api.models.llm import (
    SummaryRequest, ComprehensiveSummaryRequest, ChatRequest, 
    SummaryResponse, ChatResponse
)
from api.models.user import User
from api.services.llm_service import LLMService
from api.middleware.auth import get_current_user

router = APIRouter()


@router.post("/llm/summary", response_model=SummaryResponse)
async def generate_summary(
    request: SummaryRequest,
    current_user: User = Depends(get_current_user)
) -> SummaryResponse:
    """
    Generate a summary of search results using LLM
    Includes user context for personalized summaries
    """
    try:
        llm_service = LLMService()
        result = await llm_service.generate_summary(request, current_user)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summary generation failed: {str(e)}")


@router.post("/llm/comprehensive-summary")
async def generate_comprehensive_summary(
    request: ComprehensiveSummaryRequest,
    current_user: User = Depends(get_current_user)
) -> Dict[str, str]:
    """
    Generate a comprehensive summary of selected documents
    """
    try:
        llm_service = LLMService()
        result = await llm_service.generate_comprehensive_summary(request, current_user)
        return {"summary": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comprehensive summary generation failed: {str(e)}")


@router.post("/llm/chat", response_model=ChatResponse)
async def chat(
    raw_request: Request,
    current_user: User = Depends(get_current_user)
) -> ChatResponse:
    """
    Generate a chat response based on user message and search context
    Maintains conversation history and user context
    """
    try:
        # Get the raw JSON and parse as ChatRequest
        raw_data = await raw_request.json()
        request = ChatRequest(**raw_data)
        
        llm_service = LLMService()
        result = await llm_service.generate_chat_response(request, current_user)
        return result
    except Exception as e:
        # Return a fallback response instead of raising an error
        # This maintains the conversation flow even when LLM fails
        return ChatResponse(
            response=f"I'm sorry, I'm having trouble accessing the AI system right now. Error: {str(e)}. Please try again later or check the system configuration.",
            context_used=len(request.search_context) > 0,
            sources_referenced=[]
        )