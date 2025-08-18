from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel
import json
import os
import uuid

# Create router that matches Postman collection endpoints exactly
router = APIRouter(tags=["chat"])

# Pydantic models matching the Postman collection request format
class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    input: str
    provider: Optional[str] = "GCP_CLAUDE"
    provider_id: Optional[str] = "claude-3-5-sonnet@20240620"
    knnField: Optional[str] = "embeddings"
    rankWindowSize: Optional[int] = 50
    rankConstant: Optional[int] = 20
    k: Optional[int] = 5
    indexName: Optional[str] = "datasets-datanaut.ekb.qodo.data-ada.sg.uat"
    embeddingModelType: Optional[str] = "DBS_QUDO_EMBEDDING_MODEL"
    numberOfCandidates: Optional[int] = 10
    temperature: Optional[float] = 0.01
    embeddingModelHostType: Optional[str] = "DBS_HOST_EMBEDDING_MODEL"
    size: Optional[int] = 20
    knowledge_scope: Optional[str] = "world"
    radius: Optional[int] = 1
    collapseField: Optional[str] = "docId"
    rerank_topk: Optional[int] = 5

# Simple file-based storage for chat sessions
CHATS_FILE = "data/chat_sessions.json"

def ensure_data_directory() -> None:
    """Ensure data directory exists"""
    os.makedirs("data", exist_ok=True)

def load_chat_sessions() -> List[Dict[str, Any]]:
    """Load chat sessions from file"""
    ensure_data_directory()
    try:
        if os.path.exists(CHATS_FILE):
            with open(CHATS_FILE, 'r') as f:
                return json.load(f)
        return []
    except Exception as e:
        print(f"Error loading chat sessions: {e}")
        return []

def save_chat_sessions(sessions: List[Dict[str, Any]]) -> None:
    """Save chat sessions to file"""
    ensure_data_directory()
    try:
        with open(CHATS_FILE, 'w') as f:
            json.dump(sessions, f, indent=2, default=str)
    except Exception as e:
        print(f"Error saving chat sessions: {e}")


# ENDPOINT 1: POST /chat - matches Postman collection exactly
@router.post("/chat")
async def send_chat_message(request: ChatRequest) -> Dict[str, Any]:
    """Send a chat message - matches Postman collection /chat endpoint exactly"""
    try:
        session_id = request.session_id or str(uuid.uuid4())
        
        # Mock response matching the Postman collection format EXACTLY
        output_text = f"This is a mock response to your question: {request.input}. In a real implementation, this would be processed by the {request.provider} model with knowledge scope '{request.knowledge_scope}' and provide comprehensive insights based on the available data."
        mock_citations = [
            {
                "title": "Lenovo.pdf",
                "content": "PC tool Benefit\n\nLenovo Settings (Windows) An application that provides power management features, such as\nConnected Standby for the user.\n\nAdaptive Thermal Management Adjusts system power and fan speeds based on ambient levels.\n\nActive Directory and LANDesk® Supports remote deployment of power schemes and global settings\nto allow administrators the ability to control and enforce ThinkPad\nenergy savings company-wide.\n\nEasyResume Provides quick recovery from computer lid close, balancing low power\nstate by suppressing CPU usage at lid close.\n\nIntelligent Cooling Balances thermal performance to adjust settings to provide a cooler\nsurface for comfort while optimizing product energy.\n\nEnergy Saving Power Supply Unit\n(PSU)\n\nThe PSU turns off the internal fan when the system detects the power\nload is low and saves energy consumption.",
                "url": "https://1bank.sharepoint.com/sites/ekb-uat-usecase-testing/Shared%20Documents/POC%20Evaluation/Lenovo.pdf",
                "text_used": "Lenovo Settings (Windows) An application that provides power management features, such as Connected Standby for the user."
            },
            {
                "title": "Lenovo.pdf",
                # Simulate missing content, fallback to text_used
                "content": "Smart Power (Monitors) A power and energy management feature that dynamically detects and optimizes the distribution of power.",
                "url": "https://1bank.sharepoint.com/sites/ekb-uat-usecase-testing/Shared%20Documents/POC%20Evaluation/Lenovo.pdf",
                "text_used": "Smart Power (Monitors) A power and energy management feature that dynamically detects and optimizes the distribution of power."
            }
        ]

        # Append citation contents with markers [1], [2], ...
        if mock_citations:
            for idx, cite in enumerate(mock_citations):
                content = cite.get("content") or cite.get("text_used") or ""
                marker = f"[{idx+1}]"
                # Add a space before marker if content is not empty
                if content:
                    output_text += f"\n\n{content}{marker}"
        # Ensure all citations have 'content', fallback to 'text_used' if missing
        for cite in mock_citations:
            if not cite.get("content") and cite.get("text_used"):
                cite["content"] = cite["text_used"]
        mock_response = {
            "code": 0,
            "msg": "success",
            "trace_id": str(uuid.uuid4()).replace('-', ''),
            "data": {
                "output": output_text,
                "session_id": session_id,
                "citation": mock_citations,
                "evaluation": {
                    "HALLUCINATION": "PASS",
                    "RELEVANCY": "PASS",
                    "ACCURACY": "PASS"
                }
            }
        }
        
        # Save the conversation to sessions for /messages endpoint
        sessions = load_chat_sessions()
        
        # Find existing session or create new one
        session_found = False
        for session in sessions:
            if session.get("session_id") == session_id:
                session_found = True
                # Add user message
                user_msg = {
                    "idx": len(session.get("messages", [])) + 1,
                    "msg_id": str(uuid.uuid4()),
                    "content": request.input,
                    "role": "user",
                    "created_at": datetime.now().isoformat() + "Z"
                }
                # Add assistant message
                assistant_msg = {
                    "idx": len(session.get("messages", [])) + 2,
                    "msg_id": str(uuid.uuid4()),
                    "content": output_text,
                    "role": "assistant",
                    "created_at": datetime.now().isoformat() + "Z"
                }
                
                if "messages" not in session:
                    session["messages"] = []
                session["messages"].extend([user_msg, assistant_msg])
                session["updated_at"] = datetime.now().isoformat()
                break
        
        if not session_found:
            # Create new session
            user_msg = {
                "idx": 1,
                "msg_id": str(uuid.uuid4()),
                "content": request.input,
                "role": "user",
                "created_at": datetime.now().isoformat() + "Z"
            }
            assistant_msg = {
                "idx": 2,
                "msg_id": str(uuid.uuid4()),
                "content": output_text,
                "role": "assistant",
                "created_at": datetime.now().isoformat() + "Z"
            }
            
            new_session = {
                "session_id": session_id,
                "first_message": request.input,
                "created_at": datetime.now().isoformat() + "Z",
                "updated_at": datetime.now().isoformat() + "Z",
                "messages": [user_msg, assistant_msg]
            }
            sessions.append(new_session)
        
        save_chat_sessions(sessions)
        return mock_response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending chat message: {str(e)}")


# ENDPOINT 2: GET /messages - matches Postman collection exactly
@router.get("/messages")
async def get_messages(session_id: str = Query(..., description="Session ID to get messages for")) -> Dict[str, Any]:
    """Get messages for a session - matches Postman collection /messages endpoint"""
    try:
        sessions = load_chat_sessions()
        
        # Find the session
        for session in sessions:
            if session.get("session_id") == session_id:
                messages = session.get("messages", [])
                return {
                    "code": 0,
                    "msg": "success",
                    "trace_id": str(uuid.uuid4()).replace('-', ''),
                    "data": messages
                }
        
        # If session not found, return empty messages
        return {
            "code": 0,
            "msg": "success",
            "trace_id": str(uuid.uuid4()).replace('-', ''),
            "data": []
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving messages: {str(e)}")


# ENDPOINT 3: GET /sessions - matches Postman collection exactly
@router.get("/sessions")
async def get_sessions() -> Dict[str, Any]:
    """Get all sessions - matches Postman collection /sessions endpoint"""
    try:
        sessions = load_chat_sessions()
        
        # Convert to the expected format
        session_list = []
        for session in sessions:
            session_info = {
                "session_id": session.get("session_id", ""),
                "first_message": session.get("first_message", ""), 
                "created_at": session.get("created_at", "")
            }
            session_list.append(session_info)
        
        # Sort by created_at descending (newest first)  
        session_list.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        
        return {
            "code": 0,
            "msg": "success",
            "trace_id": str(uuid.uuid4()).replace('-', ''),
            "data": session_list
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving sessions: {str(e)}")
