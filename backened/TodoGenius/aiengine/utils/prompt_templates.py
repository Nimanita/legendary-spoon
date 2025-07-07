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
                for task in recent_tasks[:10]
            ])
        else:
            tasks_context = "No recent tasks available (new user)"
        
        # Format recent context
        context_info = ""
        if recent_context:
            context_info = "\n".join([
                f"- [{ctx.get('source_type', 'unknown')}]: {(ctx.get('content', '') or '')[:150]}..."
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
        
        prompt = f"""
You are a smart task-management assistant. A user has entered a new task: "{task_name}"

Do not modify the task name in any way—use it verbatim as the “title” in your output.

Based on the user’s recent tasks and context, enrich this task with detailed information.
Output ONLY valid JSON—no markdown fences, no explanatory text.

RECENT TASKS (last 10):
{tasks_context}

RECENT CONTEXT (last 24 hours):
{context_info}

EXISTING CATEGORIES (with colors):
{categories_info}

PRIORITY SCORING:
- 0.0–0.3: Low priority (routine, non-urgent)
- 0.3–0.7: Medium priority (important, moderate urgency)
- 0.7–1.0: High priority (urgent, critical)

Please analyze the task "{task_name}" and respond with valid JSON only, following this schema:

{{
  "title": "<original task name>",

  "descriptions": "<2–3 sentence detailed plan, goal driven approach…>",
    
  ,

  "categories": {{ "name": "existing_or_new_category1", "color": "existing colour of selected category or new colour #hex1 if category dont exist" }},
   ,

  "priority_score": 0.0–1.0,
  "deadline": 1–30,
  "confidence": 0.0–1.0,
  "reasoning": "Briefly explain your category choices and priority/timeframe decision."
  
}}
Output ONLY valid JSON—no markdown fences, no explanatory text.
"""
        
        return prompt
