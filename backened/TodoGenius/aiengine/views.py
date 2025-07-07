from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q
from django.utils import timezone
from .services.task_processor import TaskProcessor
from .services.lm_studio_client import LMStudioClient
from django.utils import timezone
from datetime import timedelta
from django.db.models import Q
from .serializers import TaskEnhancementInputSerializer, TaskEnhancementOutputSerializer

@api_view(['POST'])
def enhance_task(request):
    """
    Enhance a task with AI-generated insights based on user context and history
    
    Expected input: {"task_name": "Buy groceries"}
    
    Returns enhanced task data with:
    - Enhanced title and description
    - Suggested category
    - Priority score
    - Suggested deadline
    - Reasoning for decisions
    """
    try:
        # Validate input
        input_serializer = TaskEnhancementInputSerializer(data=request.data)
        if not input_serializer.is_valid():
            return Response({
                'success': False,
                'message': 'Invalid input data',
                'errors': input_serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        task_name = input_serializer.validated_data['task_name']
        
        # Initialize the smart task enhancer (CREATE AN INSTANCE)
        task_processor = TaskProcessor()
        
        # Enhance the task (CALL ON INSTANCE)
        enhancement_result = task_processor.enhance_task(task_name=task_name)
        
        if not enhancement_result['success']:
            return Response({
                'success': False,
                'message': 'Failed to enhance task',
                'data': enhancement_result['data']
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Validate output
        output_serializer = TaskEnhancementOutputSerializer(data=enhancement_result['data'])
        if not output_serializer.is_valid():
            print(f"Output validation errors: {output_serializer.errors}")
            # Return the data anyway, but with a warning
            return Response({
                'success': True,
                'message': 'Task enhanced successfully (with validation warnings)',
                'data': enhancement_result['data'],
                'warnings': output_serializer.errors
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': True,
            'message': 'Task enhanced successfully',
            'data': output_serializer.validated_data,
            'meta': {
                           }
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        print(f"Error in enhance_task view: {str(e)}")
        return Response({
            'success': False,
            'message': 'Internal server error',
            'data': {
                'title': request.data.get('task_name', 'Untitled Task'),
                'descriptions': [
                    'Complete the task as planned',
                    'Focus on achieving the desired outcome',
                    'Work on this task when appropriate'
                ],
                'category': {'name': 'general', 'color': '#3B82F6', 'is_new': True},
                'priority_score': 0.5,
                'confidence': 0.0,
                'reasoning': 'Error occurred during enhancement'
            }
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

