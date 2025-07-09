from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import json
import re
from django.utils import timezone
import random

class DataFormatter:
    """Format data for AI processing with robust error handling"""
    
    @staticmethod
    def format_task_for_ai(task_data: Dict) -> Dict:
        """Format task data for AI processing"""
        return {
            'title': task_data.get('title', ''),
            'description': task_data.get('description', ''),
            'category': task_data.get('category', 'general'),
            'priority_score': task_data.get('priority_score', 0.5),
            'deadline': task_data.get('deadline'),
            'status': task_data.get('status', 'pending'),
            'created_at': task_data.get('created_at'),
        }
    
    @staticmethod
    def format_context_for_ai(context_data: List[Dict]) -> List[Dict]:
        """Format context data for AI processing"""
        formatted = []
        for ctx in context_data:
            formatted.append({
                'content': ctx.get('content', ''),
                'source_type': ctx.get('source_type', 'unknown'),
                'context_date': ctx.get('context_date'),
                'created_at': ctx.get('created_at'),
                'is_processed': ctx.get('is_processed', False)
            })
        return formatted
    
    @staticmethod
    def validate_ai_response(response: Dict, expected_fields: List[str]) -> bool:
        """Validate AI response contains expected fields"""
        if not isinstance(response, dict):
            return False
        
        for field in expected_fields:
            if field not in response:
                return False
        
        return True
    
   
    
    @staticmethod
    def days_to_datetime(days: int) -> str:
        """Convert days to proper datetime format"""
        try:
            target_date = timezone.now() + timedelta(days=days)
            return target_date.strftime('%Y-%m-%dT%H:%M:%S')
        except Exception:
            # Default to 3 days from now
            target_date = timezone.now() + timedelta(days=3)
            return target_date.strftime('%Y-%m-%dT%H:%M:%S')
    
    @staticmethod
    def generate_creative_description(task_name: str) -> str:
        """Generate creative description when parsing fails"""
        creative_templates = [
            f"Transform your approach to '{task_name}' by breaking it into manageable steps and focusing on the end goal.",
            f"Tackle '{task_name}' with renewed energy and strategic planning for optimal results.",
            f"Approach '{task_name}' systematically, considering all aspects and potential challenges.",
            f"Execute '{task_name}' efficiently by prioritizing key components and maintaining focus.",
            f"Complete '{task_name}' with attention to detail and commitment to excellence.",
            f"Organize and execute '{task_name}' using proven methodologies and best practices.",
            f"Successfully accomplish '{task_name}' by leveraging available resources and expertise.",
            f"Deliver outstanding results for '{task_name}' through careful planning and execution.",
            f"Excel at '{task_name}' by maintaining high standards and consistent effort.",
            f"Achieve mastery in '{task_name}' through dedicated practice and continuous improvement."
        ]
        return random.choice(creative_templates)
    
    @staticmethod
    def extract_json_from_response(text: str) -> Optional[Dict]:
        """
        Extract JSON from AI response using multiple robust strategies
        """
        if not text or not text.strip():
            return None
        
        # Strategy 1: Try direct JSON parsing first
        try:
            return json.loads(text.strip())
        except json.JSONDecodeError:
            pass
        
        # Strategy 2: Remove markdown code blocks and clean up
        try:
            # Remove ```json and ``` wrappers
            cleaned = re.sub(r'^```(?:json)?\s*', '', text.strip(), flags=re.MULTILINE)
            cleaned = re.sub(r'\s*```$', '', cleaned, flags=re.MULTILINE)
            return json.loads(cleaned)
        except json.JSONDecodeError:
            pass
        
        # Strategy 3: Extract first complete JSON object with proper brace matching
        try:
            # Find the first opening brace
            start_idx = text.find('{')
            if start_idx == -1:
                return None
            
            brace_count = 0
            end_idx = start_idx
            in_string = False
            escape_next = False
            
            for i, char in enumerate(text[start_idx:], start_idx):
                if escape_next:
                    escape_next = False
                    continue
                
                if char == '\\':
                    escape_next = True
                    continue
                
                if char == '"' and not escape_next:
                    in_string = not in_string
                    continue
                
                if not in_string:
                    if char == '{':
                        brace_count += 1
                    elif char == '}':
                        brace_count -= 1
                        if brace_count == 0:
                            end_idx = i
                            break
            
            if end_idx > start_idx:
                json_str = text[start_idx:end_idx + 1]
                return json.loads(json_str)
        except Exception:
            pass
        
        # Strategy 4: Try to fix common JSON issues
        try:
            # Extract potential JSON content
            start_idx = text.find('{')
            if start_idx == -1:
                return None
            
            # Find the last closing brace
            end_idx = text.rfind('}')
            if end_idx == -1 or end_idx <= start_idx:
                return None
            
            json_candidate = text[start_idx:end_idx + 1]
            
            # Fix common issues
            # Remove trailing commas
            json_candidate = re.sub(r',\s*}', '}', json_candidate)
            json_candidate = re.sub(r',\s*]', ']', json_candidate)
            
            # Fix incomplete lines (remove lines that don't end properly)
            lines = json_candidate.split('\n')
            cleaned_lines = []
            for line in lines:
                line = line.strip()
                if line and not line.endswith(',') and not line.endswith('{') and not line.endswith('}') and ':' in line and not line.endswith('"'):
                    # Try to close incomplete string values
                    if line.count('"') % 2 == 1:
                        line += '"'
                cleaned_lines.append(line)
            
            json_candidate = '\n'.join(cleaned_lines)
            
            return json.loads(json_candidate)
        except Exception:
            pass
        
        # Strategy 5: Extract key-value pairs manually
        try:
            result = {}
            
            # Extract title
            title_match = re.search(r'"title":\s*"([^"]*)"', text)
            if title_match:
                result['title'] = title_match.group(1)
            
            # Extract descriptions
            desc_match = re.search(r'"descriptions?":\s*"([^"]*)"', text)
            if desc_match:
                result['descriptions'] = desc_match.group(1)
            
            # Extract category name
            cat_match = re.search(r'"(?:categories?|category)":\s*{[^}]*"name":\s*"([^"]*)"', text)
            if cat_match:
                result['category'] = {'name': cat_match.group(1)}
            
            # Extract category color
            color_match = re.search(r'"color":\s*"([^"]*)"', text)
            if color_match and 'category' in result:
                result['category']['color'] = color_match.group(1)
            
            # Extract priority score
            priority_match = re.search(r'"priority_score":\s*([0-9.]+)', text)
            if priority_match:
                result['priority_score'] = float(priority_match.group(1))
            
            # Extract deadline
            deadline_match = re.search(r'"deadline":\s*([0-9]+)', text)
            if deadline_match:
                result['deadline'] = int(deadline_match.group(1))
            
            # Extract confidence
            conf_match = re.search(r'"confidence":\s*([0-9.]+)', text)
            if conf_match:
                result['confidence'] = float(conf_match.group(1))
            
            # Extract reasoning
            reason_match = re.search(r'"reasoning":\s*"([^"]*)"', text)
            if reason_match:
                result['reasoning'] = reason_match.group(1)
            
            if result:
                return result
                
        except Exception:
            pass
        
        return None
    
    @staticmethod
    def validate_and_fix_response(data: Dict, original_task_name: str = "") -> Dict:
        """
        Validate and fix common issues in AI responses with extreme fallback
        """
        if not isinstance(data, dict):
            return DataFormatter.create_extreme_fallback(original_task_name)

        # Add any completely missing required fields with defaults
        required_defaults = {
            'title': original_task_name or 'Untitled Task',
            'descriptions': DataFormatter.generate_creative_description(original_task_name or 'this task'),
            'category': {'name': 'general', 'color': '#3B82F6'},
            'priority_score': 0.5,
            'deadline': 3,
            'confidence': 0.8,
            'reasoning': 'AI analysis completed'
        }
        
        for field, default in required_defaults.items():
            if field not in data:
                data[field] = default

        # Fix title
        if not data.get('title') or data['title'].strip() == '':
            data['title'] = original_task_name or 'Untitled Task'

        # Fix descriptions format
        descs = data.get('descriptions', '')
        if isinstance(descs, list):
            data['descriptions'] = descs[0] if descs else DataFormatter.generate_creative_description(data['title'])
        elif not isinstance(descs, str) or not descs.strip():
            data['descriptions'] = DataFormatter.generate_creative_description(data['title'])

        # Normalize category
        cat = data.get('category')
        if isinstance(cat, str):
            data['category'] = {'name': cat, 'color': '#3B82F6'}
        elif not isinstance(cat, dict):
            data['category'] = {'name': 'general', 'color': '#3B82F6'}
        else:
            # Ensure both name & color exist
            data['category'].setdefault('name', 'general')
            data['category'].setdefault('color', '#3B82F6')

        # Clamp numeric fields into [0,1]
        for num_field, default in [('priority_score', 0.5), ('confidence', 0.8)]:
            try:
                val = float(data.get(num_field, default))
                data[num_field] = max(0.0, min(1.0, val))
            except (ValueError, TypeError):
                data[num_field] = default

        # Fix deadline - convert days to datetime
        deadline_days = data.get('deadline', 3)
        try:
            deadline_days = int(deadline_days)
            data['deadline'] = DataFormatter.days_to_datetime(deadline_days)
        except (ValueError, TypeError):
            data['deadline'] = DataFormatter.days_to_datetime(3)

        return data
    
    @staticmethod
    def create_extreme_fallback(task_name: str) -> Dict:
        """Create extreme fallback response when all parsing fails"""
        return {
            'title': task_name or 'Untitled Task',
            'descriptions': DataFormatter.generate_creative_description(task_name or 'this task'),
            'category': {'name': 'general', 'color': '#3B82F6'},
            'priority_score': 0.5,
            'deadline': DataFormatter.days_to_datetime(3),
            'confidence': 0.8,
            'reasoning': 'AI parsing failed - using intelligent fallback with creative description'
        }

    def parse_ai_response(self, response: str, original_task_name: str = "") -> Dict:
        """Parse AI response using standard industry practices with robust fallback"""
        try:
            # First, try to extract the actual response text
            if isinstance(response, dict):
                # If response is already a dict from the API client
                if 'text' in response:
                    response_text = response['text']
                elif 'content' in response:
                    response_text = response['content']
                else:
                    response_text = str(response)
            else:
                response_text = str(response)
            
            print(f"Attempting to parse response: {response_text[:200]}...")
            
            # Use the robust parser
            parsed_data = DataFormatter.extract_json_from_response(response_text)
            
            if parsed_data is None:
                print("All parsing strategies failed, using extreme fallback")
                return DataFormatter.create_extreme_fallback(original_task_name)
            
            # Validate and fix the response
            validated_data = DataFormatter.validate_and_fix_response(parsed_data, original_task_name)
            print("VALIDATED DATA:", validated_data)
            return validated_data
            
        except Exception as e:
            print(f"Error parsing AI response: {str(e)}")
            print(f"Raw response: {response}")
            
            # Return extreme fallback with creative description
            return DataFormatter.create_extreme_fallback(original_task_name)