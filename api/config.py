from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    
    # CORS Configuration - handled as property
    _cors_origins_str: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001"
    
    @property
    def CORS_ORIGINS(self) -> List[str]:
        # Get from environment or use default
        cors_str = os.getenv('CORS_ORIGINS', self._cors_origins_str)
        if isinstance(cors_str, str) and cors_str.strip():
            return [origin.strip() for origin in cors_str.split(",") if origin.strip()]
        return ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"]
    
    # Elasticsearch Configuration
    ELASTICSEARCH_URL: str = ""
    ELASTICSEARCH_API_KEY: str = ""
    ELASTICSEARCH_INDEX: str = ""
    ELASTICSEARCH_SEARCH_APPLICATION: str = ""
    ELASTICSEARCH_USE_SEARCH_APPLICATION: bool = False
    
    # Semantic Search Configuration
    ELASTICSEARCH_SEMANTIC_ENABLED: bool = False
    ELASTICSEARCH_SEMANTIC_MODEL: str = ""
    ELASTICSEARCH_SEMANTIC_FIELD_PREFIX: str = "semantic_"
    ELASTICSEARCH_HYBRID_SEARCH_WEIGHT: float = 0.7
    
    # OpenAI Configuration
    OPENAI_API_KEY: str = ""
    OPENAI_ENDPOINT: str = "https://api.openai.com/v1/chat/completions"
    OPENAI_MODEL: str = "gpt-3.5-turbo"
    
    # Authentication Configuration
    API_SECRET_KEY: str = "development-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    model_config = {
        "env_file": ".env",
        "extra": "ignore"  # Ignore extra fields from .env
    }



settings = Settings()