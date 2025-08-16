from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
import uvicorn

from config import settings
from routers import search, llm, health, auth, employees, chats, summary
from middleware.auth import get_current_user


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app = FastAPI(
    title="Enterprise Search API",
    description="Python API layer for Enterprise Search with Elasticsearch and LLM integration",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(auth.router, prefix="/api/v1", tags=["auth"])
app.include_router(search.router, prefix="/api/v1", tags=["search"])
app.include_router(llm.router, prefix="/api/v1", tags=["llm"])
app.include_router(employees.router, prefix="/api/v1", tags=["employees"])
app.include_router(chats.router, prefix="/api/v1", tags=["chats"])
app.include_router(summary.router, prefix="/api/v1", tags=["summary"])

@app.get("/")
async def root():
    return {"message": "Enterprise Search API", "version": "1.0.0"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )