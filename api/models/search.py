from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Union
from datetime import datetime


class SearchFilter(BaseModel):
    source: Optional[List[str]] = []
    content_type: Optional[List[str]] = []
    date_range: Optional[str] = "all"
    author: Optional[List[str]] = []
    tags: Optional[List[str]] = []
    exclude_content_type: Optional[List[str]] = []


class SearchRequest(BaseModel):
    query: str
    filters: Optional[SearchFilter] = SearchFilter()
    size: Optional[int] = 20
    from_: Optional[int] = 0
    semantic_enabled: Optional[bool] = None
    hybrid_weight: Optional[float] = None

    class Config:
        fields = {"from_": "from"}


class SearchResult(BaseModel):
    id: str
    title: str
    summary: str
    source: str
    url: str
    author: str
    date: str
    content_type: str
    tags: List[str]
    relevance_score: int
    highlights: Dict[str, List[str]]
    content: str
    
    model_config = {"extra": "ignore"}


class SearchResponse(BaseModel):
    results: List[SearchResult]
    total: int
    query: str
    took: int
    filters_applied: SearchFilter
    search_mode: str


class ElasticsearchConfig(BaseModel):
    endpoint: str
    api_key: Optional[str] = None
    index: Optional[str] = None
    search_application_name: Optional[str] = None
    use_search_application: bool = False
    semantic_enabled: bool = False
    semantic_model: Optional[str] = None
    semantic_field_prefix: str = "semantic_"
    hybrid_search_weight: float = 0.7