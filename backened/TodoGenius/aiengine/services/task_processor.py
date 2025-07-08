
from ..utils.prompt_templates import PromptTemplates
import json
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from django.utils import timezone
from .lm_studio_client import LMStudioClient
from ..utils.data_formatter import DataFormatter
from ..constants import PRIORITY_RANGES
from django.apps import apps
import random
import traceback

class TaskProcessor:
    """Process tasks for description enhancement and categorization"""
    
    def __init__(self):
        self.client = LMStudioClient()
        self.formatter = DataFormatter()
        self.used_colors = set()  # Track colors to avoid duplicates

    
    def enhance_task(self, task_name: str) -> Dict:
        """
        Enhance a task with AI-generated insights based on context and history
        """
        try:
            # Get recent tasks (last 10) with category colors
            recent_tasks = self.get_recent_tasks()
            
            # Get recent context (last 24 hours)
            recent_context = self.get_existing_context()
            
            # Get existing categories with colors
            existing_categories = self._get_existing_categories()
            
            # Prepare the prompt with all context including colors
            prompt = PromptTemplates._build_enhancement_prompt(task_name, recent_tasks, recent_context, existing_categories)
            
            # Call AI model once with comprehensive prompt
            response = self.client.generate_completion(prompt=prompt)
            print("AI Response received:", response)
            
            # Parse and validate AI response with original task name
            enhanced_data = self.formatter.parse_ai_response(response, task_name)
            
            # Process category with color
            enhanced_data = self._process_category_with_color(enhanced_data, existing_categories)
            
            # Sanitize the response
            sanitized_data = self.formatter.sanitize_ai_response(enhanced_data)
            
            # Ensure title is never empty
            if 'title' not in sanitized_data or not sanitized_data['title'] or sanitized_data['title'].strip() == '':
                sanitized_data['title'] = task_name
            
            # Ensure deadline is in proper format
            if 'deadline' not in sanitized_data:
                sanitized_data['deadline'] = DataFormatter.days_to_datetime(3)
            
            # Calculate suggested deadline from timeframe_days if present
            if 'timeframe_days' in sanitized_data:
                try:
                    days = int(sanitized_data['timeframe_days'])
                    suggested_deadline = timezone.now() + timedelta(days=days)
                    sanitized_data['suggested_deadline'] = suggested_deadline.strftime('%Y-%m-%dT%H:%M:%S')
                except (ValueError, TypeError):
                    pass
            
            return {
                'success': True,
                'data': sanitized_data
            }
            
        except Exception as e:
            print(f"Error enhancing task: {str(e)}")
            print(traceback.format_exc())
            
            # Return enhanced fallback with creative description
            return {
                'success': False,
                'data': {
                    'title': task_name,
                    'descriptions': DataFormatter.generate_creative_description(task_name),
                    'category': {'name': 'general', 'color': '#3B82F6', 'is_new': True},
                    'priority_score': 0.5,
                    'deadline': DataFormatter.days_to_datetime(3),
                    'confidence': 0.0,
                    'reasoning': 'AI enhancement failed, using intelligent fallback with creative description'
                }
            }

    
    def _get_existing_categories(self) -> List[Dict]:
        """Get all existing categories from database with colors"""
        try:
            Category = apps.get_model('tasks', 'Category')
            
            categories = Category.objects.all().order_by('-usage_frequency', 'name')
            category_list = []
            
            for cat in categories:
                category_list.append({
                    'id': str(cat.id),
                    'name': cat.name,
                    'color': cat.color,
                    'usage_frequency': cat.usage_frequency
                })
                self.used_colors.add(cat.color)
            
            return category_list
            
        except Exception as e:
            print(f"Error getting categories: {str(e)}")
            return []

    
    
    
    def _get_available_colors(self) -> List[str]:
        """Get list of available colors for new categories"""
        default_colors = [
            '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
            '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6B7280',
            '#14B8A6', '#F43F5E', '#8B5A2B', '#6366F1', '#D97706'
        ]
        
        # Return colors not already used
        available = [color for color in default_colors if color not in self.used_colors]
        
        # If all colors are used, return a random selection
        if not available:
            available = random.sample(default_colors, 5)
        
        return available

    
    def _process_category_with_color(self, enhanced_data: Dict, existing_categories: List[Dict]) -> Dict:
        """Process category response from AI and ensure proper color assignment"""
        
        if 'category' not in enhanced_data:
            enhanced_data['category'] = {'name': 'general', 'color': '#3B82F6', 'is_new': True}
            return enhanced_data
        
        category = enhanced_data['category']
        
        # If AI returned just a string (old format), convert to object
        if isinstance(category, str):
            category_name = category.lower()
            # Find existing category
            existing_cat = next((cat for cat in existing_categories if cat['name'].lower() == category_name), None)
            if existing_cat:
                enhanced_data['category'] = {
                    'name': existing_cat['name'],
                    'color': existing_cat['color'],
                    'is_new': False
                }
            else:
                # Create new category with available color
                available_colors = self._get_available_colors()
                enhanced_data['category'] = {
                    'name': category_name,
                    'color': available_colors[0] if available_colors else '#3B82F6',
                    'is_new': True
                }
        
        # If AI returned object format, validate it
        elif isinstance(category, dict):
            category_name = category.get('name', 'general').lower()
            category_color = category.get('color', '#3B82F6')
            
            # Check if this matches an existing category
            existing_cat = next((cat for cat in existing_categories if cat['name'].lower() == category_name), None)
            if existing_cat:
                enhanced_data['category'] = {
                    'name': existing_cat['name'],
                    'color': existing_cat['color'],
                    'is_new': False
                }
            else:
                # Validate the color is available
                if category_color in self.used_colors:
                    available_colors = self._get_available_colors()
                    category_color = available_colors[0] if available_colors else '#3B82F6'
                
                enhanced_data['category'] = {
                    'name': category_name,
                    'color': category_color,
                    'is_new': True
                }
        
        return enhanced_data

    
    def _parse_ai_response(self, response: str) -> Dict:
        """Parse AI response and extract JSON data"""
        try:
           
            if not isinstance(response, str):
                response = json.dumps(response)

            response = response.strip()
            # Remove any markdown formatting
            if response.startswith('```json'):
                response = response[7:]
            if response.endswith('```'):
                response = response[:-3]
            
            # Parse JSON
            parsed = json.loads(response)
            
            # Validate required fields
            required_fields = ['title', 'descriptions', 'categories', 'priority_score', 'deadline']
            missing = [f for f in required_fields if f not in parsed]
            if missing:
                raise ValueError(f"AI response missing fields: {missing}") 
            # Ensure descriptions is a list with exactly 3 items
            if 'descriptions' in parsed:
                descriptions = parsed['descriptions']
                if not isinstance(descriptions, list):
                    parsed['descriptions'] = [str(descriptions), str(descriptions), str(descriptions)]
                elif len(descriptions) < 3:
                    while len(descriptions) < 3:
                        descriptions.append(descriptions[0] if descriptions else "Complete the task")
                    parsed['descriptions'] = descriptions[:3]
                elif len(descriptions) > 3:
                    parsed['descriptions'] = descriptions[:3]
            
            return parsed
            
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {str(e)}")
            raise ValueError("Invalid JSON response from AI")
        except Exception as e:
            print(f"Response parsing error: {str(e)}")
            print(traceback.format_exc())
            raise ValueError(f"Failed to parse AI response: {str(e)}")

        
    def get_recent_tasks(self) -> list:
        """Get last 10 tasks for context WITH CATEGORY COLORS"""
        try:
            Task = apps.get_model('tasks', 'Task')
            recent_tasks = Task.objects.select_related('category').order_by('-created_at')[:10]
            
            formatted_tasks = []
            for task in recent_tasks:
                formatted_tasks.append({
                    'title': task.title,
                    'description': task.description,
                    'category_name': task.category.name if task.category else 'general',
                    'category_color': task.category.color if task.category else '#3B82F6',
                    'priority_score': float(task.priority_score),
                    'status': task.status,
                    'created_at': task.created_at.isoformat() if task.created_at else None,
                    'deadline': task.deadline.isoformat() if task.deadline else None
                })
            
            return formatted_tasks
            
        except Exception as e:
            print(f"Error getting recent tasks: {str(e)}")
            return []

    
    def get_existing_context(self) -> list:
        """Get recent context for AI analysis"""
        try:
            Context = apps.get_model('context', 'Context')
            twenty_four_hours_ago = timezone.now() - timedelta(hours=24)
            
            recent_context = Context.objects.filter(
                created_at__gte=twenty_four_hours_ago
            ).order_by('-created_at')[:10]
            
            formatted_context = []
            for ctx in recent_context:
                formatted_context.append({
                    'content': ctx.content,
                    'source_type': ctx.source_type,
                    'context_date': ctx.context_date.isoformat() if ctx.context_date else None,
                    'created_at': ctx.created_at.isoformat() if ctx.created_at else None,
                    'is_processed': ctx.is_processed
                })
            return formatted_context
            
        except Exception as e:
            print(f"Error getting recent context: {str(e)}")
            return []