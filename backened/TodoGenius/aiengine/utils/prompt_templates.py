# ai_engine/utils/prompt_templates.py

from typing import Dict, List, Any
from datetime import datetime, timedelta
import json

class PromptTemplates:
    """Collection of prompt templates for different AI tasks"""
    
    def _build_enhancement_prompt(task_name: str, recent_tasks: List[Dict], recent_context: List[Dict], existing_categories: List[Dict]) -> str:
        """Build comprehensive prompt for AI enhancement with category colors"""
        
        # Format recent tasks for context WITH COLORS
        tasks_context = ""
        if recent_tasks:
            tasks_context = "\n".join([
                f"- {task.get('title', '')}: {(task.get('description', '') or '')[:100]}... "
                f"(Category: {task.get('category_name', 'N/A')} [{task.get('category_color', '#000000')}], Priority: {task.get('priority_score', 0):.2f})"
                for task in recent_tasks[:5]
            ])
        else:
            tasks_context = "No recent tasks available (new user)"
        
        # Format recent context
        context_info = ""
        if recent_context:
            context_info = "\n".join([
                f"- [{ctx.get('source_type', 'unknown')}]: {(ctx.get('content', '') or '')}..."
                for ctx in recent_context[:5]
            ])
        else:
            context_info = "No recent context available"
        
        # Format existing categories WITH COLORS
        categories_info = ""
        if existing_categories:
            categories_info = "\n".join([
                f"- {cat['name']} [{cat['color']}]: ... (Used {cat['usage_frequency']} times)"
                for cat in existing_categories[:15]
            ])
        else:
            categories_info = "No existing categories"
        
        # Get available colors for new categories
        #available_colors = self._get_available_colors()
        
        prompt = f"""You are TodoGenius AI, an intelligent task management assistant. Analyze the user's input "{task_name}" and generate an enhanced task with context-aware insights.

CONTEXT ANALYSIS:
Recent Context (last 24 hours): {context_info}
Recent Tasks: {tasks_context}
Available Categories: {categories_info}

TASK: "{task_name}"

Your response must be ONLY valid JSON in this exact format:

{{
  "title": "{task_name}",
  "descriptions": "Write a 2-3 sentence description here. Include specific details from the context when available. Make it actionable and personalized.",
  "category": {{
    "name": "category_name",
    "color": "#HEX_COLOR"
  }},
  "priority_score": 0.0,
  "deadline": 0,
  "confidence": 0.0,
  "reasoning": "Brief explanation of your analysis"
}}

ANALYSIS GUIDELINES:

1. PRIORITY SCORING (0.0-1.0):
   - Emergency/urgent context → 0.8-1.0
   - Business meetings/deadlines → 0.7-0.9
   - Important personal events → 0.6-0.8
   - Routine with mild pressure → 0.4-0.6
   - General tasks → 0.2-0.4

2. DEADLINE (days from now):
   - "today", "urgent", "now" → 1
   - "tomorrow", specific times → 2
   - "this week" → 3-5
   - "next week" → 7-10
   - No urgency → 14-30

3. DESCRIPTION RULES:
   - Be specific and actionable
   - Include context details (names, times, locations)
   - 2-3 sentences, 45-85 words
   - Professional but conversational tone

4. CATEGORY SELECTION:
   - Match existing categories when possible
   - Use context clues (work/personal/health/etc.)
   - Assign appropriate colors

EXAMPLES:

Input: "team meeting"
Context: "Sarah mentioned budget review at 2 PM tomorrow"
Output:
{{
  "title": "team meeting",
  "descriptions": "Attend the budget review meeting with Sarah tomorrow at 2 PM. Prepare your department's financial analysis and come ready to discuss cost optimization strategies. This meeting will finalize budget allocations for the next quarter.",
  "category": {{"name": "work", "color": "#3B82F6"}},
  "priority_score": 0.7,
  "deadline": 2,
  "confidence": 0.9,
  "reasoning": "Work meeting with specific time and person mentioned in context"
}}

Input: "grocery shopping"
Context: "Mom's birthday dinner Saturday, need ingredients"
Output:
{{
  "title": "grocery shopping",
  "descriptions": "Buy groceries for Mom's birthday dinner this Saturday. Pick up ingredients for her favorite dishes and don't forget to grab a birthday card. Plan to shop early to ensure fresh ingredients for the special meal.",
  "category": {{"name": "personal", "color": "#10B981"}},
  "priority_score": 0.6,
  "deadline": 3,
  "confidence": 0.8,
  "reasoning": "Personal task with specific event context and moderate time pressure"
}}

Now analyze "{task_name}" and provide your JSON response:"""

        return prompt
