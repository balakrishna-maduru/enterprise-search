import httpx
import json
from typing import List, Dict, Any
from api.models.llm import (
    SummaryRequest, ComprehensiveSummaryRequest, ChatRequest, 
    ChatResponse, SummaryResponse, ChatMessage
)
from api.models.search import SearchResult
from api.models.user import User
from api.config import settings
import logging

logger = logging.getLogger(__name__)


class LLMService:
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.endpoint = settings.OPENAI_ENDPOINT
        self.model = settings.OPENAI_MODEL

    def _get_headers(self) -> Dict[str, str]:
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }

    async def generate_summary(self, request: SummaryRequest, user: User) -> SummaryResponse:
        """Generate a summary of search results"""
        try:
            context = [
                {
                    "title": result.title,
                    "summary": result.summary,
                    "source": result.source,
                    "content": result.content[:500] if result.content else result.summary,
                    "relevance_score": result.relevance_score
                }
                for result in request.search_results
            ]

            system_prompt = self._build_summary_system_prompt(user, len(context))
            user_prompt = self._build_summary_user_prompt(request.query, context)

            response = await self._call_openai([
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ], max_tokens=300)

            # Calculate source distribution
            source_distribution = {}
            for result in request.search_results:
                source = result.source
                source_distribution[source] = source_distribution.get(source, 0) + 1

            return SummaryResponse(
                summary=response,
                source_distribution=source_distribution,
                confidence_score=0.8  # Could be calculated based on relevance scores
            )

        except Exception as e:
            logger.error(f"Summary generation failed: {e}")
            # Fallback summary
            sources = list(set(result.source for result in request.search_results))
            fallback_summary = (
                f"Found {len(request.search_results)} relevant documents across {', '.join(sources)}. "
                f"The results include {', '.join(result.title for result in request.search_results[:3])}. "
                "Unable to generate AI summary - please check OpenAI API configuration."
            )
            return SummaryResponse(
                summary=fallback_summary,
                source_distribution={source: sum(1 for r in request.search_results if r.source == source) for source in sources},
                confidence_score=0.0
            )

    async def generate_comprehensive_summary(self, request: ComprehensiveSummaryRequest, user: User) -> str:
        """Generate a comprehensive summary of selected documents"""
        try:
            system_prompt = self._build_comprehensive_system_prompt(user)
            user_prompt = self._build_comprehensive_user_prompt(request.selected_documents, user)

            response = await self._call_openai([
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ], max_tokens=1500)

            return response

        except Exception as e:
            logger.error(f"Comprehensive summary generation failed: {e}")
            return self._generate_fallback_comprehensive_summary(request.selected_documents, user)

    async def generate_chat_response(self, request: ChatRequest, user: User) -> ChatResponse:
        """Generate a chat response based on context and conversation history"""
        try:
            has_context = len(request.search_context) > 0
            
            system_prompt = self._build_chat_system_prompt(user, has_context)
            user_prompt = self._build_chat_user_prompt(request.message, request.search_context, has_context)
            
            # Build message history
            messages = [{"role": "system", "content": system_prompt}]
            
            # Add conversation history
            for msg in request.conversation_history:
                messages.append({"role": msg.role, "content": msg.content})
            
            # Add current user message
            messages.append({"role": "user", "content": user_prompt})

            response = await self._call_openai(messages, max_tokens=500)
            
            sources_referenced = []
            if has_context:
                sources_referenced = list(set(result.get('source', 'unknown') for result in request.search_context))

            return ChatResponse(
                response=response,
                context_used=has_context,
                sources_referenced=sources_referenced
            )

        except Exception as e:
            logger.error(f"Chat response generation failed: {e}")
            return self._generate_fallback_chat_response(request, e)

    async def _call_openai(self, messages: List[Dict[str, str]], max_tokens: int = 500, temperature: float = 0.7) -> str:
        """Make a call to OpenAI API"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.endpoint,
                headers=self._get_headers(),
                json={
                    "model": self.model,
                    "messages": messages,
                    "max_tokens": max_tokens,
                    "temperature": temperature,
                    "presence_penalty": 0.1,
                    "frequency_penalty": 0.1
                }
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]

    def _build_summary_system_prompt(self, user: User, context_count: int) -> str:
        return f"""You are an AI assistant for a Bank's enterprise search system. Your role is to analyze search results and provide concise, professional summaries for {user.name}, a {user.position} in {user.department}.

Context: You have access to {context_count} documents from various sources (Jira, Confluence, SharePoint) related to the user's query.

Guidelines:
- Provide a professional, executive-level summary
- Highlight key insights and critical information
- Mention source distribution and relevance scores
- Focus on actionable insights relevant to a {user.position}
- Keep the summary concise but informative (2-3 sentences)"""

    def _build_summary_user_prompt(self, query: str, context: List[Dict[str, Any]]) -> str:
        context_text = "\n".join([
            f"{i+1}. Title: {item['title']}\n"
            f"   Source: {item['source']}\n"
            f"   Summary: {item['summary']}\n"
            f"   Relevance: {item['relevance_score']}%"
            for i, item in enumerate(context)
        ])

        return f"""Query: "{query}"

Search Results Context:
{context_text}

Please provide a professional summary of these search results in response to the user's query."""

    def _build_comprehensive_system_prompt(self, user: User) -> str:
        return f"""You are an AI assistant for a Bank's enterprise search system. Your role is to create comprehensive summaries for {user.name}, a {user.position} in {user.department}.

Your task is to analyze multiple documents and create a unified, executive-level summary that:
- Synthesizes key information across all selected documents
- Identifies common themes, patterns, and insights
- Highlights critical issues, decisions, or opportunities
- Provides actionable recommendations relevant to a {user.position}
- Structures information in a clear, professional format
- Considers the business context of {user.department}

Focus on insights that would be valuable for strategic decision-making and operational excellence."""

    def _build_comprehensive_user_prompt(self, documents: List[SearchResult], user: User) -> str:
        doc_summaries = "\n".join([
            f"Document {i+1}: {doc.title}\n"
            f"Source: {doc.source}\n"
            f"Author: {doc.author}\n"
            f"Date: {doc.date}\n"
            f"Summary: {doc.summary}\n"
            f"Content Preview: {doc.content[:800] if doc.content else doc.summary}\n"
            f"Tags: {', '.join(doc.tags)}\n"
            f"Relevance Score: {doc.relevance_score}%\n\n---\n"
            for i, doc in enumerate(documents)
        ])

        return f"""Please create a comprehensive summary of the following {len(documents)} documents:

{doc_summaries}

Please provide:
1. Executive Summary (2-3 sentences)
2. Key Themes & Insights
3. Critical Issues or Opportunities
4. Actionable Recommendations
5. Next Steps or Follow-up Actions

Tailor your analysis to be most relevant for a {user.position} in {user.department}."""

    def _build_chat_system_prompt(self, user: User, has_context: bool) -> str:
        context_source = "retrieved documents" if has_context else "general knowledge"
        
        return f"""You are a helpful AI assistant for {user.company or 'the organization'}'s enterprise search system. You are chatting with {user.name}, a {user.position} in the {user.department} department.

Your role:
- Help analyze and discuss information from enterprise documents (Jira, Confluence, SharePoint)
- Provide insights relevant to a senior professional in their field
- Answer questions based on {context_source} in a professional, concise manner
- Reference specific documents when relevant
- If no search context is available, provide general helpful answers but mention limitations
- Maintain a helpful but professional tone

Current context: {"Documents found and analyzed" if has_context else "No specific search context - providing general assistance"}."""

    def _build_chat_user_prompt(self, message: str, search_context: List[Dict[str, Any]], has_context: bool) -> str:
        if has_context:
            context_summary = "\n".join([
                f"{i+1}. {result.get('title', 'Unknown')} ({result.get('source', 'unknown')})\n"
                f"   Summary: {result.get('summary', '')}\n"
                f"   Relevance: {result.get('relevance_score', result.get('relevanceScore', 0))}%\n"
                f"   URL: {result.get('url', '#')}\n"
                f"   Content Preview: {result.get('content', result.get('summary', ''))[:300]}"
                for i, result in enumerate(search_context)
            ])

            return f"""{message}

Available search results for context:
{context_summary}

Please respond helpfully based on the search results and conversation context."""
        else:
            return f"""{message}

Note: No specific search context is available. Please provide a helpful general response while noting that access to specific company documents would improve the answer."""

    def _generate_fallback_comprehensive_summary(self, documents: List[SearchResult], user: User) -> str:
        sources = list(set(doc.source for doc in documents))
        authors = list(set(doc.author for doc in documents))
        
        doc_list = "\n".join([
            f"{i+1}. **{doc.title}** ({doc.source}) - {doc.summary[:100]}..."
            for i, doc in enumerate(documents)
        ])

        return f"""## Summary of {len(documents)} Selected Documents

**Sources:** {', '.join(sources)}
**Authors:** {', '.join(authors)}
**Date Range:** {documents[0].date if documents else 'N/A'} - {documents[-1].date if documents else 'N/A'}

**Key Documents:**
{doc_list}

**Note:** Unable to generate AI-powered summary. Please check OpenAI API configuration. You can review the individual documents above for detailed information.

**Recommendation:** Review each document individually for complete context and insights relevant to your role as {user.position}."""

    def _generate_fallback_chat_response(self, request: ChatRequest, error: Exception) -> ChatResponse:
        context_count = len(request.search_context)
        sources = list(set(result.source for result in request.search_context)) if request.search_context else []
        
        if "401" in str(error):
            response = f"I'm having trouble accessing the AI system - please check the OpenAI API key configuration. Based on the {context_count} search results currently displayed, I can see content from {', '.join(sources)}."
        elif "429" in str(error):
            response = f"The AI system is currently rate limited. Please try again in a moment. In the meantime, you can review the {context_count} search results directly."
        else:
            response = f"I'm having trouble accessing the AI system right now. Based on the {context_count} search results currently displayed, I can see content from {', '.join(sources)}. Please try rephrasing your question or check the results directly."

        return ChatResponse(
            response=response,
            context_used=len(request.search_context) > 0,
            sources_referenced=sources
        )