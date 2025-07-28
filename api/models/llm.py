from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from .search import SearchResult
from .user import User


class SummaryRequest(BaseModel):
    query: str
    search_results: List[SearchResult]


class ComprehensiveSummaryRequest(BaseModel):
    selected_documents: List[SearchResult]


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: Optional[str] = None


class ChatRequest(BaseModel):
    message: str
    search_context: Optional[List[Dict[str, Any]]] = []  # More flexible - accepts any dict
    conversation_history: Optional[List[ChatMessage]] = []


class ChatResponse(BaseModel):
    response: str
    context_used: bool
    sources_referenced: List[str]


class SummaryResponse(BaseModel):
    summary: str
    source_distribution: Dict[str, int]
    confidence_score: Optional[float] = None


class LLMConfig(BaseModel):
    api_key: str
    endpoint: str = "https://api.openai.com/v1/chat/completions"
    model: str = "gpt-3.5-turbo"
    max_tokens: int = 1500
    temperature: float = 0.7