from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import json
import re

class DataFormatter:
    """Format data for AI processing"""
    
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
    def sanitize_ai_response(response: Dict) -> Dict:
        """Sanitize AI response for safe processing"""
        sanitized = {}
        
        # Define safe fields and their types
        safe_fields = {
            'priority_score': float,
            'confidence': float,
            'reasoning': str,
            'deadline': str,
            'timeframe_days': int,
            'enhanced_description': str,
            'suggested_category': str,
            'analysis': str,
            'urgency_indicators': list,
            'key_insights': list,
            'suggested_actions': list,
            'alternative_categories': list,
            'factors_considered': list,
            'suggested_tasks': list,
            'descriptions' : str,
            
        }
        
        for field, field_type in safe_fields.items():
            if field in response:
                try:
                    if field_type == float:
                        value = float(response[field])
                        # Clamp values between 0 and 1 for scores
                        if field in ['priority_score', 'confidence']:
                            value = max(0.0, min(1.0, value))
                        sanitized[field] = value
                    elif field_type == int:
                        sanitized[field] = int(response[field])
                    elif field_type == str:
                        sanitized[field] = str(response[field])[:1000]  # Limit length
                    elif field_type == list:
                        if isinstance(response[field], list):
                            sanitized[field] = response[field][:10]  # Limit list length
                        else:
                            sanitized[field] = []
                except (ValueError, TypeError):
                    # Skip invalid fields
                    continue
        
        return sanitized
    
    @staticmethod
    def extract_json_from_response(text: str) -> Optional[Dict]:
        """
        Extract JSON from AI response using multiple strategies
        This is the industry standard approach
        """
        if not text or not text.strip():
            return None
        
        # Strategy 1: Try direct JSON parsing first
        try:
            return json.loads(text.strip())
        except json.JSONDecodeError:
            pass
        
        # Strategy 2: Remove markdown code blocks
        try:
            # Remove ```json and ``` wrappers
            cleaned = re.sub(r'^```(?:json)?\s*', '', text.strip(), flags=re.MULTILINE)
            cleaned = re.sub(r'\s*```$', '', cleaned, flags=re.MULTILINE)
            return json.loads(cleaned)
        except json.JSONDecodeError:
            pass
        
        # Strategy 3: Find JSON blocks using regex
        try:
            # Look for JSON object patterns
            json_pattern = r'\{(?:[^{}]|{[^{}]*})*\}'
            matches = re.findall(json_pattern, text, re.DOTALL)
            
            for match in matches:
                try:
                    return json.loads(match)
                except json.JSONDecodeError:
                    continue
        except Exception:
            pass
        
        # Strategy 4: Extract between braces with proper nesting
        try:
            start_idx = text.find('{')
            if start_idx == -1:
                return None
            
            brace_count = 0
            end_idx = start_idx
            
            for i, char in enumerate(text[start_idx:], start_idx):
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
        
        # Strategy 5: Line-by-line cleanup (for malformed responses)
        try:
            lines = text.split('\n')
            cleaned_lines = []
            
            for line in lines:
                line = line.strip()
                # Skip obvious non-JSON lines
                if (line.startswith('#') or 
                    line.startswith('//') or 
                    line.startswith('Here') or 
                    line.startswith('The') or
                    line.startswith('```')):
                    continue
                cleaned_lines.append(line)
            
            cleaned_text = '\n'.join(cleaned_lines)
            return json.loads(cleaned_text)
        except Exception:
            pass
        
        return None
    
    @staticmethod
    def validate_and_fix_response(data: Dict) -> Dict:
        """
        Validate and fix common issues in AI responses:
        - Ensure 'descriptions' always exists as a list of 3 strings
        - Support singular 'description' → 'descriptions'
        - Provide defaults for missing required fields
        """
        if not isinstance(data, dict):
            return {}

        '''# 1. Normalize 'description' → 'descriptions'
        if 'descriptions' not in data and 'description' in data:
            # if it's a str, wrap it; if list, take it directly
            desc = data.pop('description')
            data['descriptions'] = [desc] if isinstance(desc, str) else list(desc)'''

        # 2. Add any completely missing required fields with defaults
        required_defaults = {
            'title': '',
            'descriptions': 'Task must be completed',
            'category': {'name': 'general', 'color': '#3B82F6'},
            'priority_score': 0.5,
            'confidence': 0.8,
            'reasoning': 'AI analysis completed'
        }
        for field, default in required_defaults.items():
            if field not in data:
                data[field] = default

        # 3. Fix descriptions format & enforce exactly 3 items
        descs = data['descriptions']
        if isinstance(descs, list):
            data['descriptions'] = descs[0]
        

        # 4. Normalize category
        cat = data.get('category')
        if isinstance(cat, str):
            data['category'] = {'name': cat, 'color': '#3B82F6'}
        elif not isinstance(cat, dict):
            data['category'] = {'name': 'general', 'color': '#3B82F6'}
        else:
            # ensure both name & color exist
            data['category'].setdefault('name', 'general')
            data['category'].setdefault('color', '#3B82F6')

        # 5. Clamp numeric fields into [0,1]
        for num_field, default in [('priority_score', 0.5), ('confidence', 0.8)]:
            try:
                val = float(data.get(num_field, default))
                data[num_field] = max(0.0, min(1.0, val))
            except (ValueError, TypeError):
                data[num_field] = default

        return data




    def parse_ai_response(self, response: str) -> Dict:
        """Parse AI response using standard industry practices"""
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
            
            # Use the standard parser
            parsed_data = DataFormatter.extract_json_from_response(response_text)
            
            if parsed_data is None:
                raise ValueError("Could not extract valid JSON from AI response")
            
            # Validate and fix the response
            validated_data = DataFormatter.validate_and_fix_response(parsed_data)
            print("VALIDATED DATA" , validated_data)
            return validated_data
            
        except Exception as e:
            print(f"Error parsing AI response: {str(e)}")
            print(f"Raw response: {response}")
            
            # Return a safe fallback
            return {
                'title': 'Parse Error',
                'descriptions': 'Could not parse AI response',
                'category': {'name': 'general', 'color': '#3B82F6'},
                'priority_score': 0.5,
                'confidence': 0.0,
                'reasoning': f'Failed to parse AI response: {str(e)}'
            }