from fastapi import APIRouter, HTTPException
from typing import List, Optional, Dict, Any
from datetime import datetime
import json
import os

router = APIRouter(prefix="/chats", tags=["chats"])

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

@router.get("/")
async def get_chat_sessions() -> List[Dict[str, Any]]:
    """Get all chat sessions"""
    try:
        sessions = load_chat_sessions()
        return sessions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving chat sessions: {str(e)}")

@router.post("/")
async def save_chat_sessions_endpoint(sessions: List[Dict[str, Any]]) -> Dict[str, str]:
    """Save chat sessions"""
    try:
        # Add updated timestamp to sessions
        for session in sessions:
            session["updated_at"] = datetime.now().isoformat()
        
        save_chat_sessions(sessions)
        return {"message": "Chat sessions saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving chat sessions: {str(e)}")

@router.get("/{chat_id}")
async def get_chat_session(chat_id: str) -> Dict[str, Any]:
    """Get a specific chat session"""
    try:
        sessions = load_chat_sessions()
        chat = next((s for s in sessions if s["id"] == chat_id), None)
        if not chat:
            raise HTTPException(status_code=404, detail="Chat session not found")
        return chat
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving chat session: {str(e)}")

@router.delete("/{chat_id}")
async def delete_chat_session(chat_id: str) -> Dict[str, str]:
    """Delete a specific chat session"""
    try:
        sessions = load_chat_sessions()
        original_count = len(sessions)
        sessions = [s for s in sessions if s["id"] != chat_id]
        
        if len(sessions) == original_count:
            raise HTTPException(status_code=404, detail="Chat session not found")
        
        save_chat_sessions(sessions)
        return {"message": "Chat session deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting chat session: {str(e)}")

@router.post("/{chat_id}/messages")
async def add_message_to_chat(chat_id: str, message: Dict[str, Any]) -> Dict[str, str]:
    """Add a message to a specific chat session"""
    try:
        sessions = load_chat_sessions()
        chat_index = next((i for i, s in enumerate(sessions) if s["id"] == chat_id), None)
        
        if chat_index is None:
            raise HTTPException(status_code=404, detail="Chat session not found")
        
        # Add message to the chat
        sessions[chat_index]["messages"].append(message)
        sessions[chat_index]["updated_at"] = datetime.now().isoformat()
        
        save_chat_sessions(sessions)
        return {"message": "Message added successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding message: {str(e)}")
