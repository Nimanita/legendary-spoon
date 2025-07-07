import requests
import json
import time
from typing import Dict, Any, Optional
from django.conf import settings
from ..constants import LM_STUDIO_BASE_URL, MAX_TOKENS, TEMPERATURE, MODEL_NAME

class LMStudioClient:
    """Client for interacting with LM Studio local API"""
    
    def __init__(self):
        self.base_url = getattr(settings, 'LM_STUDIO_BASE_URL', LM_STUDIO_BASE_URL)
        self.max_tokens = getattr(settings, 'AI_MAX_TOKENS', MAX_TOKENS)
        self.temperature = getattr(settings, 'AI_TEMPERATURE', TEMPERATURE)
        self.model_name = getattr(settings, 'AI_MODEL_NAME', MODEL_NAME)
        # Increased timeout for slower models
        self.timeout = getattr(settings, 'LM_STUDIO_TIMEOUT', 120)  # 2 minutes default
    
    def _make_request(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Make HTTP request to LM Studio API"""
        try:
            url = f"{self.base_url.rstrip('/')}/{endpoint.lstrip('/')}"
            headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
            
            # Add debug logging
            print(f"Making request to: {url}")
            print(f"Request data: {json.dumps(data, indent=2)}")
            
            response = requests.post(
                url, 
                json=data, 
                headers=headers,
                timeout=self.timeout
            )
            
            response.raise_for_status()
            result = response.json()
            print(f"Response received: {json.dumps(result, indent=2)}")
            return result
            
        except requests.exceptions.Timeout as e:
            error_msg = f"Request timed out after {self.timeout} seconds: {str(e)}"
            print(error_msg)
            return {
                'error': error_msg,
                'success': False
            }
        except requests.exceptions.ConnectionError as e:
            error_msg = f"Connection error - is LM Studio running on {self.base_url}? {str(e)}"
            print(error_msg)
            return {
                'error': error_msg,
                'success': False
            }
        except requests.exceptions.RequestException as e:
            error_msg = f"LM Studio API request failed: {str(e)}"
            print(error_msg)
            return {
                'error': error_msg,
                'success': False
            }
        except Exception as e:
            error_msg = f"Unexpected error in LM Studio client: {str(e)}"
            print(error_msg)
            return {
                'error': error_msg,
                'success': False
            }
    
    def generate_completion(self, prompt: str, max_tokens: Optional[int] = None) -> Dict[str, Any]:
        """Generate text completion using LM Studio"""
        start_time = time.time()
        
        # Match your successful Postman request format
        data = {
            "model": self.model_name,
            "prompt": prompt,
            "max_tokens": max_tokens or self.max_tokens,
            "temperature": self.temperature,
            "reset": True,  # This matches your Postman request
            # Remove parameters that might not be supported
            # "cache_prompt": False,
            # "top_p": 0.9,
            # "frequency_penalty": 0.0,
            # "presence_penalty": 0.0,
            # "stop": ["</response>", "\n\n---"]
        }
        
        response = self._make_request("completions", data)
        processing_time = time.time() - start_time
        
        if 'error' in response:
            return {
                'success': False,
                'error': response['error'],
                'processing_time': processing_time,
                'token_usage': 0
            }
        
        try:
            text = response.get('choices', [{}])[0].get('text', '').strip()
            
            token_usage = response.get('usage', {}).get('total_tokens', 0)
            
            return {
                'success': True,
                'text': text,
                'processing_time': processing_time,
                'token_usage': token_usage,
                'full_response': response
            }
        except Exception as e:
            return {
                'success': False,
                'error': f"Failed to parse response: {str(e)}",
                'processing_time': processing_time,
                'token_usage': 0
            }
    
    def generate_chat_completion(self, messages: list, max_tokens: Optional[int] = None) -> Dict[str, Any]:
        """Generate chat completion using LM Studio"""
        start_time = time.time()
        
        data = {
            "model": self.model_name,
            "messages": messages,
            "max_tokens": max_tokens or self.max_tokens,
            "temperature": self.temperature,
            "stream": False
        }
        
        response = self._make_request("chat/completions", data)
        processing_time = time.time() - start_time
        
        if 'error' in response:
            return {
                'success': False,
                'error': response['error'],
                'processing_time': processing_time,
                'token_usage': 0
            }
        
        try:
            message = response.get('choices', [{}])[0].get('message', {})
            content = message.get('content', '').strip()
            token_usage = response.get('usage', {}).get('total_tokens', 0)
            
            return {
                'success': True,
                'content': content,
                'processing_time': processing_time,
                'token_usage': token_usage,
                'full_response': response
            }
        except Exception as e:
            return {
                'success': False,
                'error': f"Failed to parse response: {str(e)}",
                'processing_time': processing_time,
                'token_usage': 0
            }
    
    def check_health(self) -> Dict[str, Any]:
        """Check if LM Studio is running and accessible"""
        try:
            # Try to get models list
            response = requests.get(
                f"{self.base_url}/models",
                timeout=10  # Shorter timeout for health check
            )
            
            if response.status_code == 200:
                models = response.json().get('data', [])
                return {
                    'status': 'healthy',
                    'available_models': [model.get('id', 'unknown') for model in models],
                    'current_model': self.model_name
                }
            else:
                return {
                    'status': 'unhealthy',
                    'error': f"HTTP {response.status_code}"
                }
        except Exception as e:
            return {
                'status': 'unhealthy',
                'error': str(e)
            }
    
    def test_simple_completion(self) -> Dict[str, Any]:
        """Test with a simple completion request"""
        return self.generate_completion("Hello", max_tokens=10)
    
    def extract_json_from_response(self, text: str) -> Optional[Dict]:
        """Extract JSON from AI response text"""
        try:
            # Try to find JSON in the response
            start_markers = ['{', '[']
            end_markers = ['}', ']']
            
            for start_marker in start_markers:
                start_idx = text.find(start_marker)
                if start_idx != -1:
                    # Find the matching closing marker
                    bracket_count = 0
                    end_idx = start_idx
                    
                    for i, char in enumerate(text[start_idx:], start_idx):
                        if char in start_markers:
                            bracket_count += 1
                        elif char in end_markers:
                            bracket_count -= 1
                            if bracket_count == 0:
                                end_idx = i
                                break
                    
                    if end_idx > start_idx:
                        json_str = text[start_idx:end_idx + 1]
                        try:
                            return json.loads(json_str)
                        except json.JSONDecodeError:
                            continue
            
            return None
        except Exception as e:
            print(f"Error extracting JSON: {str(e)}")
            return None