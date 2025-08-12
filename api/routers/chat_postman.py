from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel
import json
import os
import uuid

# Create router for Postman collection format (without prefix)
router = APIRouter(tags=["chat-postman"])

# Import models and functions from chats.py
from .chats import ChatRequest, load_chat_sessions, save_chat_sessions, ensure_data_directory


@router.post("/chat")
async def send_chat_message_postman(request: ChatRequest) -> Dict[str, Any]:
    """Send a chat message - matches Postman collection /chat endpoint exactly"""
    try:
        session_id = request.session_id or str(uuid.uuid4())
        
        # Mock response matching the Postman collection format EXACTLY
        mock_response = {
            "code": 0,
            "msg": "success", 
            "trace_id": str(uuid.uuid4()).replace('-', ''),
            "data": {
                "output": f"This is a mock response to your question: {request.input}. In a real implementation, this would be processed by the {request.provider} model with knowledge scope '{request.knowledge_scope}' and provide comprehensive insights based on the available data.",
                "session_id": session_id,
                "citation": None,
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
                    "content": mock_response["data"]["output"],
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
                "content": mock_response["data"]["output"],
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


@router.get("/messages")
async def get_messages_postman(session_id: str = Query(..., description="Session ID to get messages for")) -> Dict[str, Any]:
    """Get messages for a session - matches Postman collection /messages endpoint"""
    try:
        sessions = load_chat_sessions()
        
        # Find the session - handle both old and new formats
        for session in sessions:
            session_id_to_check = session.get("session_id") or session.get("id")
            
            if session_id_to_check == session_id:
                messages = session.get("messages", [])
                
                # Convert messages to expected format if needed
                formatted_messages = []
                for i, msg in enumerate(messages):
                    if isinstance(msg, dict):
                        # Handle new format (already has idx, msg_id, content, role, created_at)
                        if 'msg_id' in msg and 'role' in msg:
                            formatted_messages.append(msg)
                        else:
                            # Convert old format
                            formatted_msg = {
                                "idx": i + 1,
                                "msg_id": msg.get("id", f"msg-{i}"),
                                "content": msg.get("content", ""),
                                "role": "assistant" if not msg.get("isUser", True) else "user",
                                "created_at": msg.get("timestamp", msg.get("created_at", ""))
                            }
                            formatted_messages.append(formatted_msg)
                
                return {
                    "code": 0,
                    "msg": "success",
                    "trace_id": str(uuid.uuid4()).replace('-', ''),
                    "data": formatted_messages
                }
        
        # If session not found, return empty messages
        return {
            "code": 0,
            "msg": "success",
            "trace_id": str(uuid.uuid4()).replace('-', ''),
            "data": []
        }
        
    except Exception as e:
        print(f"Error in get_messages_postman: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error retrieving messages: {str(e)}")


@router.get("/sessions")
async def get_sessions_postman() -> Dict[str, Any]:
    """Get all sessions - matches Postman collection /sessions endpoint"""
    try:
        sessions = load_chat_sessions()
        
        # Convert to the expected format
        session_list = []
        for session in sessions:
            try:
                # Handle both old format (with 'id', 'title') and new format (with 'session_id', 'first_message')
                if 'session_id' in session:
                    # New format from Postman collection
                    session_info = {
                        "session_id": session.get("session_id", ""),
                        "first_message": session.get("first_message", ""), 
                        "created_at": session.get("created_at", "")
                    }
                else:
                    # Old format - convert to new format
                    session_info = {
                        "session_id": session.get("id", ""),
                        "first_message": session.get("title", ""), 
                        "created_at": session.get("createdAt", session.get("created_at", ""))
                    }
                session_list.append(session_info)
            except Exception as session_error:
                print(f"Error processing session: {session}, error: {session_error}")
                continue
        
        # Sort by created_at descending (newest first)  
        try:
            session_list.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        except Exception as sort_error:
            print(f"Sort error: {sort_error}")
            # If sorting fails, just return unsorted
            pass
        
        return {
            "code": 0,
            "msg": "success",
            "trace_id": str(uuid.uuid4()).replace('-', ''),
            "data": session_list
        }
    except Exception as e:
        print(f"Full error in get_sessions_postman: {e}")
        print(f"Error type: {type(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error retrieving sessions: {str(e)}")
