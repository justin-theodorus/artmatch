import os
from anthropic import Anthropic
from dotenv import load_dotenv
from typing import List, Dict, Any, Optional

load_dotenv()

# Initialize Claude client
claude_api_key = os.getenv('CLAUDE_API_KEY', '')

if not claude_api_key:
    print('Warning: Claude API key not found in environment variables')
    claude_client = None
else:
    claude_client = Anthropic(api_key=claude_api_key)


class ClaudeAssistant:
    def __init__(self):
        self.client = claude_client
        
    def chat(self, message: str, user_profile: Optional[Dict[str, Any]] = None, 
             conversation_history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
        """
        Chat with Claude for art discovery and recommendations
        
        Args:
            message: User's message
            user_profile: User's profile including preferences and budget
            conversation_history: Previous messages in the conversation
            
        Returns:
            Dict with response text and optional structured data
        """
        if not self.client:
            return {
                'response': 'AI assistant is currently unavailable. Please try again later.',
                'filters': None
            }
        
        # Build system prompt with user context
        system_prompt = self._build_system_prompt(user_profile)
        
        # Build messages list
        messages = []
        if conversation_history:
            messages.extend(conversation_history)
        messages.append({'role': 'user', 'content': message})
        
        try:
            response = self.client.messages.create(
                model='claude-sonnet-4-20250514',
                max_tokens=1024,
                system=system_prompt,
                messages=messages
            )
            
            response_text = response.content[0].text
            
            # Extract filters from response (basic parsing)
            filters = self._extract_filters(response_text, message)
            
            return {
                'response': response_text,
                'filters': filters
            }
        except Exception as e:
            print(f'Error calling Claude API: {e}')
            return {
                'response': 'I apologize, but I encountered an error. Please try rephrasing your question.',
                'filters': None
            }
    
    def _build_system_prompt(self, user_profile: Optional[Dict[str, Any]]) -> str:
        """Build system prompt with user context"""
        base_prompt = """You are an expert art advisor helping collectors discover artworks that match their taste and budget.

Your role is to:
1. Help users discover artworks based on their preferences
2. Provide insightful information about art styles, artists, and pieces
3. Make personalized recommendations
4. Answer questions about art in an accessible, non-pretentious way

When users ask to find artworks, try to extract:
- Style preferences (abstract, contemporary, minimalist, etc.)
- Price range
- Medium preferences (oil, digital, photography, etc.)
- Size constraints
- Theme or mood preferences

Be conversational, warm, and enthusiastic about art.

IMPORTANT: Do not use any markdown formatting in your responses. No asterisks for bold, no bullet points with dashes, no headers with hashtags. Write in plain text only as your response will be displayed in a mobile app chat interface."""

        if user_profile:
            budget_min = user_profile.get('budget_min', 0)
            budget_max = user_profile.get('budget_max', 10000)
            preferences = user_profile.get('preferences', {})
            styles = preferences.get('styles', {})
            
            user_context = f"""

Current user context:
- Budget range: ${budget_min} - ${budget_max}
- Style preferences: {', '.join(styles.keys()) if styles else 'Not yet established'}
"""
            base_prompt += user_context
        
        return base_prompt
    
    def _extract_filters(self, response_text: str, user_message: str) -> Optional[Dict[str, Any]]:
        """Extract search filters from the conversation"""
        filters = {}
        
        user_message_lower = user_message.lower()
        
        # Extract price constraints
        if 'under' in user_message_lower or 'below' in user_message_lower:
            # Try to extract price
            import re
            price_match = re.search(r'\$?(\d+(?:,\d+)?)', user_message_lower)
            if price_match:
                price = int(price_match.group(1).replace(',', ''))
                filters['price_max'] = price
        
        # Extract style preferences
        styles = ['abstract', 'contemporary', 'minimalist', 'landscape', 'portrait', 
                  'impressionist', 'surrealist', 'expressionist', 'pop-art', 'realism']
        found_styles = [style for style in styles if style in user_message_lower or style.replace('-', ' ') in user_message_lower]
        if found_styles:
            filters['styles'] = found_styles
        
        # Extract medium preferences
        mediums = ['oil', 'acrylic', 'watercolor', 'digital', 'photography', 'sculpture', 'mixed-media', 'print']
        found_mediums = [medium for medium in mediums if medium in user_message_lower]
        if found_mediums:
            filters['mediums'] = found_mediums
        
        return filters if filters else None


# Global instance
claude_assistant = ClaudeAssistant()
