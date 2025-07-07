from django.db import transaction
from django.db.models import Q
from rest_framework import status
from rest_framework.response import Response
from .models import Context
from .serializers import ContextSerializer, ContextCreateSerializer, ContextUpdateSerializer



class ContextOperations:
    """Handle all context-related business logic"""
    
    @staticmethod
    def get_all_contexts(request):
        """Get all context entries with optional filtering"""
        try:
            queryset = Context.objects.all()
            
            # Filter by source type
            source_type = request.query_params.get('source_type')
            if source_type:
                queryset = queryset.filter(source_type=source_type)
            
            # Filter by processed status
            is_processed = request.query_params.get('is_processed')
            if is_processed is not None:
                is_processed_bool = is_processed.lower() == 'true'
                queryset = queryset.filter(is_processed=is_processed_bool)
            
            # Filter by date range
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            if start_date:
                queryset = queryset.filter(context_date__gte=start_date)
            if end_date:
                queryset = queryset.filter(context_date__lte=end_date)
            
            # Search in content
            search = request.query_params.get('search')
            if search:
                queryset = queryset.filter(
                    Q(content__icontains=search)
                )
            
            # Order by creation date (newest first)
            queryset = queryset.order_by('-created_at')
            
            serializer = ContextSerializer(queryset, many=True)
            return Response({
                'success': True,
                'data': serializer.data,
                'count': queryset.count()
            }, status=status.HTTP_200_OK)
        
        except Exception as ex:
            print(f"Error retrieving contexts: {str(ex)}")
            return Response({
                'success': False,
                'message': 'Failed to retrieve contexts',
                'data': []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @staticmethod
    def create_context(request):
        """Create a new context entry"""
        try:
            serializer = ContextCreateSerializer(data=request.data)
            if serializer.is_valid():
                try:
                    with transaction.atomic():
                        context = serializer.save()
                        response_serializer = ContextSerializer(context)
                        return Response({
                            'success': True,
                            'message': 'Context entry created successfully',
                            'data': response_serializer.data
                        }, status=status.HTTP_201_CREATED)
                except Exception as e:
                    print(f"Error creating context entry: {str(e)}")
                    return Response({
                        'success': False,
                        'message': 'Failed to create context entry'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            return Response({
                'success': False,
                'message': 'Validation failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as ex:
            print(f"Error in create_context: {str(ex)}")
            return Response({
                'success': False,
                'message': 'Failed to create context entry'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @staticmethod
    def mark_context_processed(context_id):
        """Mark a context entry as processed"""
        try:
            context = Context.objects.get(id=context_id)
            context.mark_processed()
            serializer = ContextSerializer(context)
            return Response({
                'success': True,
                'message': 'Context entry marked as processed',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
        except Context.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Context entry not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as ex:
            print(f"Error marking context {context_id} as processed: {str(ex)}")
            return Response({
                'success': False,
                'message': 'Failed to mark context as processed'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    