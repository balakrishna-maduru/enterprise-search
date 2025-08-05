import httpx
import json
from typing import List, Dict, Any, Optional
from models.search import SearchRequest, SearchResult, SearchResponse, SearchFilter
from models.user import User
from config import settings
import logging

logger = logging.getLogger(__name__)


class ElasticsearchService:
    def __init__(self):
        self.endpoint = settings.ELASTICSEARCH_URL
        self.api_key = settings.ELASTICSEARCH_API_KEY
        self.index = settings.ELASTICSEARCH_INDEX
        self.search_application = settings.ELASTICSEARCH_SEARCH_APPLICATION
        self.use_search_application = settings.ELASTICSEARCH_USE_SEARCH_APPLICATION
        self.semantic_enabled = settings.ELASTICSEARCH_SEMANTIC_ENABLED
        self.semantic_model = settings.ELASTICSEARCH_SEMANTIC_MODEL
        self.semantic_field_prefix = settings.ELASTICSEARCH_SEMANTIC_FIELD_PREFIX
        self.hybrid_weight = settings.ELASTICSEARCH_HYBRID_SEARCH_WEIGHT
        
        # Debug logging
        logger.info(f"ElasticsearchService initialized with:")
        logger.info(f"  endpoint: {self.endpoint}")
        logger.info(f"  index: {self.index}")
        logger.info(f"  search_application: {self.search_application}")
        logger.info(f"  use_search_application: {self.use_search_application}")

    def _get_headers(self) -> Dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"ApiKey {self.api_key}"
        return headers

    def _get_role_boosts(self, user: Optional[User] = None) -> Dict[str, float]:
        """Get role-based boosting configuration for search results"""
        role_boosts = {
            "admin": {"priority": 1.5, "department_boost": 1.2},
            "executive": {"priority": 2.0, "department_boost": 1.5},
            "manager": {"priority": 1.3, "department_boost": 1.3},
            "employee": {"priority": 1.0, "department_boost": 1.1}
        }
        if user and user.role:
            return role_boosts.get(user.role.value, role_boosts["employee"])
        return role_boosts["employee"]

    async def test_connection(self) -> Dict[str, Any]:
        """Test Elasticsearch connection and configuration"""
        try:
            async with httpx.AsyncClient() as client:
                # Test cluster health
                health_response = await client.get(
                    f"{self.endpoint}/_cluster/health",
                    headers=self._get_headers()
                )
                health_response.raise_for_status()

                status = {"cluster_health": "connected"}

                # Test search application if configured
                if self.use_search_application and self.search_application:
                    try:
                        app_response = await client.get(
                            f"{self.endpoint}/_application/search_application/{self.search_application}",
                            headers=self._get_headers()
                        )
                        if app_response.status_code == 404:
                            status["search_application"] = "not_found"
                            logger.warning(f"Search Application '{self.search_application}' not found")
                        else:
                            app_response.raise_for_status()
                            status["search_application"] = "available"
                    except Exception as e:
                        status["search_application"] = f"error: {str(e)}"
                        logger.error(f"Search Application test failed: {e}")

                # Test index if not using search application
                if not self.use_search_application and self.index:
                    try:
                        index_response = await client.head(
                            f"{self.endpoint}/{self.index}",
                            headers=self._get_headers()
                        )
                        if index_response.status_code == 404:
                            status["index"] = "not_found"
                            logger.warning(f"Index '{self.index}' not found")
                        else:
                            index_response.raise_for_status()
                            status["index"] = "available"
                    except Exception as e:
                        status["index"] = f"error: {str(e)}"
                        logger.error(f"Index test failed: {e}")

                return status

        except Exception as e:
            logger.error(f"Elasticsearch connection test failed: {e}")
            raise

    async def search(self, request: SearchRequest, user: Optional[User] = None) -> SearchResponse:
        """Perform search using Elasticsearch"""
        try:
            if self.use_search_application and self.search_application:
                return await self._search_with_application(request, user)
            else:
                return await self._search_direct(request, user)
        except Exception as e:
            logger.error(f"Search failed: {e}")
            raise

    async def _search_with_application(self, request: SearchRequest, user: Optional[User] = None) -> SearchResponse:
        """Search using Elasticsearch Search Application"""
        search_params = {
            "query": request.query,
            "size": request.size,
            "from": request.from_,
            "semantic_enabled": request.semantic_enabled or self.semantic_enabled,
            "semantic_model": self.semantic_model,
            "semantic_field_prefix": self.semantic_field_prefix,
            "hybrid_weight": request.hybrid_weight or self.hybrid_weight
        }
        
        # Add user context if user is provided
        if user:
            search_params["user_context"] = {
                "user_id": user.id,
                "department": user.department,
                "position": user.position,
                "email": user.email,
                "role": user.role.value
            }
            # Add role-based boosting
            search_params["boost_config"] = self._get_role_boosts(user)

        # Add filters
        if request.filters.source:
            search_params["source_filter"] = request.filters.source
        if request.filters.content_type:
            search_params["content_type_filter"] = request.filters.content_type
        if request.filters.date_range and request.filters.date_range != "all":
            search_params["date_range"] = request.filters.date_range

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.endpoint}/_application/search_application/{self.search_application}/_search",
                headers=self._get_headers(),
                json=search_params
            )
            response.raise_for_status()
            data = response.json()

        return self._process_search_response(data, request)

    async def _search_direct(self, request: SearchRequest, user: Optional[User] = None) -> SearchResponse:
        """Direct Elasticsearch query"""
        search_body = self._build_search_body(request, user)

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.endpoint}/{self.index}/_search",
                headers=self._get_headers(),
                json=search_body
            )
            response.raise_for_status()
            data = response.json()

        return self._process_search_response(data, request)

    def _build_search_body(self, request: SearchRequest, user: Optional[User] = None) -> Dict[str, Any]:
        """Build Elasticsearch query body"""
        semantic_enabled = request.semantic_enabled or self.semantic_enabled
        hybrid_weight = request.hybrid_weight or self.hybrid_weight

        # Handle empty query - for default/landing page results
        if not request.query or request.query.strip() == "":
            query = {
                "bool": {
                    "must": [
                        {"match_all": {}}
                    ],
                    "filter": []
                }
            }
        elif semantic_enabled:
            # Hybrid semantic + lexical search
            query = {
                "bool": {
                    "should": [
                        # Semantic search (if available)
                        {
                            "multi_match": {
                                "query": request.query,
                                "fields": [
                                    "title^3",
                                    "content^2", 
                                    "summary^2.5",
                                    "tags^1.5",
                                    "author^1.2"
                                ],
                                "type": "best_fields",
                                "fuzziness": "AUTO",
                                "boost": hybrid_weight
                            }
                        },
                        # Traditional lexical search
                        {
                            "multi_match": {
                                "query": request.query,
                                "fields": [
                                    "title^3",
                                    "content^2",
                                    "summary^2",
                                    "tags^1.5",
                                    "author"
                                ],
                                "type": "best_fields",
                                "fuzziness": "AUTO",
                                "boost": 1 - hybrid_weight
                            }
                        }
                    ],
                    "minimum_should_match": 1,
                    "filter": []
                }
            }
        else:
            # Traditional search only
            query = {
                "bool": {
                    "must": [
                        {
                            "multi_match": {
                                "query": request.query,
                                "fields": [
                                    "title^3",
                                    "content^2",
                                    "summary^2",
                                    "tags^1.5",
                                    "author"
                                ],
                                "type": "best_fields",
                                "fuzziness": "AUTO"
                            }
                        }
                    ],
                    "filter": []
                }
            }

        # Add filters
        filters = []
        if request.filters.source and len(request.filters.source) > 0:
            filters.append({"terms": {"source": request.filters.source}})
        if request.filters.content_type and len(request.filters.content_type) > 0:
            filters.append({"terms": {"content_type": request.filters.content_type}})
        if request.filters.author and len(request.filters.author) > 0:
            filters.append({"terms": {"author": request.filters.author}})
        if request.filters.tags and len(request.filters.tags) > 0:
            filters.append({"terms": {"tags": request.filters.tags}})
        
        # Add exclude content type filter
        if hasattr(request.filters, 'exclude_content_type') and request.filters.exclude_content_type:
            filters.append({"bool": {"must_not": {"terms": {"content_type": request.filters.exclude_content_type}}}})
        
        # Date range filter
        if request.filters.date_range and request.filters.date_range != "all":
            date_filter = self._build_date_filter(request.filters.date_range)
            if date_filter:
                filters.append(date_filter)

        # Add user context boosting (boost documents from user's department)
        if user and user.department:
            query["bool"]["should"] = query["bool"].get("should", [])
            query["bool"]["should"].append({
                "term": {
                    "department": {
                        "value": user.department,
                        "boost": 1.2
                    }
                }
            })

        # Apply filters
        if filters:
            query["bool"]["filter"] = filters

        # Build the complete search body
        search_body = {
            "query": query,
            "size": request.size or 20,
            "from": request.from_ if request.from_ is not None else 0,
            "sort": [
                # Sort by score first, then by timestamp for documents with same score
                {"_score": {"order": "desc"}},
                {"timestamp": {"order": "desc", "unmapped_type": "date"}},
                # Add ratings boost if available
                {
                    "ratings.score": {
                        "order": "desc",
                        "unmapped_type": "float",
                        "missing": "_last"
                    }
                }
            ],
            "highlight": {
                "pre_tags": ["<mark>"],
                "post_tags": ["</mark>"],
                "fields": {
                    "title": {"number_of_fragments": 1},
                    "content": {"number_of_fragments": 2, "fragment_size": 150},
                    "summary": {"number_of_fragments": 1}
                }
            },
            "_source": [
                "title", "content", "summary", "source", "content_type", 
                "author", "department", "url", "timestamp", "tags", 
                "priority", "status", "project", "ratings"
            ]
        }

        logger.info(f"Built search query: {json.dumps(search_body, indent=2)}")
        return search_body

    def _build_date_filter(self, date_range: str) -> Optional[Dict[str, Any]]:
        """Build date range filter"""
        date_filters = {
            "last_week": {"range": {"timestamp": {"gte": "now-7d"}}},
            "last_month": {"range": {"timestamp": {"gte": "now-30d"}}},
            "last_year": {"range": {"timestamp": {"gte": "now-365d"}}}
        }
        return date_filters.get(date_range)

    def _process_search_response(self, data: Dict[str, Any], request: SearchRequest) -> SearchResponse:
        """Process Elasticsearch response into SearchResponse model"""
        results = []
        for hit in data.get("hits", {}).get("hits", []):
            source = hit.get("_source", {})
            result = SearchResult(
                id=hit.get("_id", ""),
                title=source.get("title", "Untitled"),
                summary=source.get("summary", source.get("content", "")[:200] + "..." if source.get("content") else ""),
                source=source.get("source", "unknown"),
                url=source.get("url", "#"),
                author=source.get("author", "Unknown"),
                date=source.get("timestamp", "Unknown"),
                content_type=source.get("content_type", "document"),
                tags=source.get("tags", []),
                relevance_score=round(hit.get("_score", 0) * 10),
                highlights=hit.get("highlight", {}),
                content=source.get("content", source.get("summary", ""))
            )
            results.append(result)

        return SearchResponse(
            results=results,
            total=data.get("hits", {}).get("total", {}).get("value", 0),
            query=request.query,
            took=data.get("took", 0),
            filters_applied=request.filters,
            search_mode="elasticsearch"
        )