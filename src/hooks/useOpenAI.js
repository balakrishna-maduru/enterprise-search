// src/hooks/useOpenAI.js
import { config } from '../config';

export const useOpenAI = () => {
  const generateSummary = async (query, searchResults, currentUser) => {
    try {
      const context = searchResults.map(result => ({
        title: result.title,
        summary: result.summary,
        source: result.source,
        content: result.content?.substring(0, 500) || result.summary,
        relevanceScore: result.relevanceScore
      }));

      const systemPrompt = `You are an AI assistant for a Bank's enterprise search system. Your role is to analyze search results and provide concise, professional summaries for ${currentUser.name}, a ${currentUser.position} in ${currentUser.department}.

Context: You have access to ${context.length} documents from various sources (Jira, Confluence, SharePoint) related to the user's query.

Guidelines:
- Provide a professional, executive-level summary
- Highlight key insights and critical information
- Mention source distribution and relevance scores
- Focus on actionable insights relevant to a ${currentUser.position}
- Keep the summary concise but informative (2-3 sentences)`;

      const userPrompt = `Query: "${query}"

Search Results Context:
${context.map((item, index) => `
${index + 1}. Title: ${item.title}
   Source: ${item.source}
   Summary: ${item.summary}
   Relevance: ${item.relevanceScore}%
`).join('')}

Please provide a professional summary of these search results in response to the user's query.`;

      const response = await fetch(config.openai.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.openai.apiKey}`
        },
        body: JSON.stringify({
          model: config.openai.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 300,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API failed: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Unable to generate summary at this time.';
    } catch (error) {
      console.error('OpenAI summary error:', error);
      const sources = [...new Set(searchResults.map(r => r.source))];
      return `Found ${searchResults.length} relevant documents across ${sources.join(', ')}. The results include ${searchResults.slice(0, 3).map(r => r.title).join(', ')}. Unable to generate AI summary - please check OpenAI API configuration.`;
    }
  };

  const generateComprehensiveSummary = async (selectedDocuments, currentUser) => {
    try {
      const systemPrompt = `You are an AI assistant for a Bank's enterprise search system. Your role is to create comprehensive summaries for ${currentUser.name}, a ${currentUser.position} in ${currentUser.department}.

Your task is to analyze multiple documents and create a unified, executive-level summary that:
- Synthesizes key information across all selected documents
- Identifies common themes, patterns, and insights
- Highlights critical issues, decisions, or opportunities
- Provides actionable recommendations relevant to a ${currentUser.position}
- Structures information in a clear, professional format
- Considers the business context of ${currentUser.department}

Focus on insights that would be valuable for strategic decision-making and operational excellence.`;

      const userPrompt = `Please create a comprehensive summary of the following ${selectedDocuments.length} documents:

${selectedDocuments.map((doc, index) => `
Document ${index + 1}: ${doc.title}
Source: ${doc.source}
Author: ${doc.author}
Date: ${doc.date}
Summary: ${doc.summary}
Content Preview: ${doc.content?.substring(0, 800) || doc.summary}
Tags: ${doc.tags.join(', ')}
Relevance Score: ${doc.relevanceScore}%

---
`).join('')}

Please provide:
1. Executive Summary (2-3 sentences)
2. Key Themes & Insights
3. Critical Issues or Opportunities
4. Actionable Recommendations
5. Next Steps or Follow-up Actions

Tailor your analysis to be most relevant for a ${currentUser.position} in ${currentUser.department}.`;

      const response = await fetch(config.openai.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.openai.apiKey}`
        },
        body: JSON.stringify({
          model: config.openai.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 1500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API failed: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Unable to generate comprehensive summary at this time.';
      
    } catch (error) {
      console.error('Summary generation error:', error);
      
      const sources = [...new Set(selectedDocuments.map(r => r.source))];
      const authors = [...new Set(selectedDocuments.map(r => r.author))];
      
      return `## Summary of ${selectedDocuments.length} Selected Documents

**Sources:** ${sources.join(', ')}
**Authors:** ${authors.join(', ')}
**Date Range:** ${selectedDocuments[0]?.date} - ${selectedDocuments[selectedDocuments.length - 1]?.date}

**Key Documents:**
${selectedDocuments.map((doc, index) => `${index + 1}. **${doc.title}** (${doc.source}) - ${doc.summary.substring(0, 100)}...`).join('\n')}

**Note:** Unable to generate AI-powered summary. Please check OpenAI API configuration. You can review the individual documents above for detailed information.

**Recommendation:** Review each document individually for complete context and insights relevant to your role as ${currentUser.position}.`;
    }
  };

  const generateChatResponse = async (userMessage, searchContext, currentUser, conversationHistory) => {
    try {
      const contextSummary = searchContext.map((result, index) => `
${index + 1}. ${result.title} (${result.source})
   Summary: ${result.summary}
   Relevance: ${result.relevanceScore}%
   URL: ${result.url}
   Content Preview: ${result.content?.substring(0, 300) || result.summary}
`).join('');

      const hasContext = searchContext.length > 0;
      const contextSource = hasContext ? "retrieved documents" : "general knowledge";

      const systemPrompt = `You are a helpful AI assistant for ${currentUser.company || 'the organization'}'s enterprise search system. You are chatting with ${currentUser.name}, a ${currentUser.position} in the ${currentUser.department} department.

Your role:
- Help analyze and discuss information from enterprise documents (Jira, Confluence, SharePoint)
- Provide insights relevant to a senior professional in their field
- Answer questions based on ${contextSource} in a professional, concise manner
- Reference specific documents when relevant
- If no search context is available, provide general helpful answers but mention limitations
- Maintain a helpful but professional tone

Current context: ${hasContext ? `${searchContext.length} documents found and analyzed` : 'No specific search context - providing general assistance'}.`;

      const userPrompt = hasContext ? 
        `${userMessage}

Available search results for context:
${contextSummary}

Please respond helpfully based on the search results and conversation context.` :
        `${userMessage}

Note: No specific search context is available. Please provide a helpful general response while noting that access to specific company documents would improve the answer.`;

      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: userPrompt }
      ];

      const response = await fetch(config.openai.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.openai.apiKey}`
        },
        body: JSON.stringify({
          model: config.openai.model,
          messages: messages,
          max_tokens: 500,
          temperature: 0.7,
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'I apologize, but I cannot process your request at the moment.';
    } catch (error) {
      console.error('OpenAI chat error:', error);
      
      if (error.message.includes('401')) {
        return `I'm having trouble accessing the AI system - please check the OpenAI API key configuration. Based on the ${searchContext.length} search results currently displayed, I can see content from ${[...new Set(searchContext.map(r => r.source))].join(', ')}.`;
      } else if (error.message.includes('429')) {
        return `The AI system is currently rate limited. Please try again in a moment. In the meantime, you can review the ${searchContext.length} search results directly.`;
      } else {
        return `I'm having trouble accessing the AI system right now. Based on the ${searchContext.length} search results currently displayed, I can see content from ${[...new Set(searchContext.map(r => r.source))].join(', ')}. Please try rephrasing your question or check the results directly.`;
      }
    }
  };

  return {
    generateSummary,
    generateComprehensiveSummary,
    generateChatResponse
  };
};