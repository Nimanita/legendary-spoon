from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from .models import Task, Category
from .serializers import (
    TaskSerializer, TaskCreateSerializer, TaskUpdateSerializer, 
    CategorySerializer)


class TaskOperations:
    """Handle all task-related business logic"""
    
    @staticmethod
    def get_all_tasks(request):
        """Get all tasks with optional filtering"""
        try:
            queryset = Task.objects.select_related('category').all()
            
            # Filter by status
            task_status = request.query_params.get('status')
            if task_status:
                queryset = queryset.filter(status=task_status)
            
            # Filter by category
            category_id = request.query_params.get('category')
            if category_id:
                queryset = queryset.filter(category_id=category_id)
            
            # Filter by priority range
            min_priority = request.query_params.get('min_priority')
            max_priority = request.query_params.get('max_priority')
            if min_priority:
                try:
                    queryset = queryset.filter(priority_score__gte=float(min_priority))
                except ValueError:
                    print(f"Invalid min_priority value: {min_priority}")
            if max_priority:
                try:
                    queryset = queryset.filter(priority_score__lte=float(max_priority))
                except ValueError:
                    print(f"Invalid max_priority value: {max_priority}")
            
            # Filter by deadline
            has_deadline = request.query_params.get('has_deadline')
            if has_deadline is not None:
                if has_deadline.lower() == 'true':
                    queryset = queryset.filter(deadline__isnull=False)
                else:
                    queryset = queryset.filter(deadline__isnull=True)
            
            # Filter overdue tasks
            overdue = request.query_params.get('overdue')
            if overdue and overdue.lower() == 'true':
                queryset = queryset.filter(
                    deadline__lt=timezone.now(),
                    status__in=['pending', 'in_progress']
                )
            
            # Search in title and description
            search = request.query_params.get('search')
            if search:
                queryset = queryset.filter(
                    Q(title__icontains=search) | Q(description__icontains=search)
                )
            
            # Order by priority score (highest first), then by created date
            queryset = queryset.order_by('-priority_score', '-created_at')
            
            serializer = TaskSerializer(queryset, many=True)
            return Response({
                "success": True,
                "message": "Tasks retrieved successfully",
                "data": serializer.data,
                "count": queryset.count()
            }, status=status.HTTP_200_OK)
            
        except Exception as ex:
            print(f"Error retrieving tasks: {str(ex)}")
            return Response({
                'success': False,
                'message': 'Failed to retrieve tasks',
                'data': [],
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    @staticmethod
    def create_task(request):
        """Create a new task"""
        try:
            serializer = TaskCreateSerializer(data=request.data)
            if serializer.is_valid():
                try:
                    with transaction.atomic():
                        task = serializer.save()
                        response_serializer = TaskSerializer(task)
                        return Response({
                            'success': True,
                            'message': 'Task created successfully',
                            'data': response_serializer.data
                        }, status=status.HTTP_201_CREATED)
                except Exception as e:
                    print(f"Error creating task: {str(e)}")
                    return Response({
                        'success': False,
                        'message': 'Failed to create task'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            return Response({
                'success': False,
                'message': 'Validation failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as ex:
            print(f"Error in create_task: {str(ex)}")
            return Response({
                'success': False,
                'message': 'Failed to create task'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @staticmethod
    def get_task_by_id(task_id):
        """Get a specific task by ID"""
        try:
            task = Task.objects.select_related('category').get(id=task_id)
            serializer = TaskSerializer(task)
            return Response({
                'success': True,
                'data': serializer.data
            }, status=status.HTTP_200_OK)
        except Task.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Task not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as ex:
            print(f"Error retrieving task {task_id}: {str(ex)}")
            return Response({
                'success': False,
                'message': 'Failed to retrieve task'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @staticmethod
    def update_task(task_id, request):
        """Update a specific task"""
        try:
            task = Task.objects.select_related('category').get(id=task_id)
            serializer = TaskUpdateSerializer(task, data=request.data, partial=True)
            if serializer.is_valid():
                try:
                    with transaction.atomic():
                        updated_task = serializer.save()
                        response_serializer = TaskSerializer(updated_task)
                        return Response({
                            'success': True,
                            'message': 'Task updated successfully',
                            'data': response_serializer.data
                        }, status=status.HTTP_200_OK)
                except Exception as e:
                    print(f"Error updating task {task_id}: {str(e)}")
                    return Response({
                        'success': False,
                        'message': 'Failed to update task'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            return Response({
                'success': False,
                'message': 'Validation failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Task.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Task not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as ex:
            print(f"Error in update_task {task_id}: {str(ex)}")
            return Response({
                'success': False,
                'message': 'Failed to update task'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @staticmethod
    def delete_task(task_id):
        """Delete a specific task"""
        try:
            task = Task.objects.get(id=task_id)
            task.delete()
            return Response({
                'success': True,
                'message': 'Task deleted successfully'
            }, status=status.HTTP_204_NO_CONTENT)
        except Task.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Task not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as ex:
            print(f"Error deleting task {task_id}: {str(ex)}")
            return Response({
                'success': False,
                'message': 'Failed to delete task'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @staticmethod
    def mark_task_completed(task_id):
        """Mark a task as completed"""
        try:
            task = Task.objects.get(id=task_id)
            task.mark_completed()
            serializer = TaskSerializer(task)
            return Response({
                'success': True,
                'message': 'Task marked as completed',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
        except Task.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Task not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as ex:
            print(f"Error marking task {task_id} as completed: {str(ex)}")
            return Response({
                'success': False,
                'message': 'Failed to mark task as completed'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @staticmethod
    def get_overdue_tasks():
        """Get all overdue tasks"""
        try:
            queryset = Task.objects.filter(
                deadline__lt=timezone.now(),
                status__in=['pending', 'in_progress']
            ).select_related('category').order_by('deadline')
            
            serializer = TaskSerializer(queryset, many=True)
            return Response({
                'success': True,
                'data': serializer.data,
                'count': queryset.count()
            }, status=status.HTTP_200_OK)
        except Exception as ex:
            print(f"Error retrieving overdue tasks: {str(ex)}")
            return Response({
                'success': False,
                'message': 'Failed to retrieve overdue tasks',
                'data': []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @staticmethod
    def get_high_priority_tasks():
        """Get tasks with high priority (>= 0.7)"""
        try:
            queryset = Task.objects.filter(
                priority_score__gte=0.7,
                status__in=['pending', 'in_progress']
            ).select_related('category').order_by('-priority_score', '-created_at')
            
            serializer = TaskSerializer(queryset, many=True)
            return Response({
                'success': True,
                'data': serializer.data,
                'count': queryset.count()
            }, status=status.HTTP_200_OK)
        except Exception as ex:
            print(f"Error retrieving high priority tasks: {str(ex)}")
            return Response({
                'success': False,
                'message': 'Failed to retrieve high priority tasks',
                'data': []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
   
class CategoryOperations:
    """Handle all category-related business logic"""
    
    @staticmethod
    def get_all_categories(request):
        """Get all categories with task counts"""
        try:
            print("inside category")
            queryset = Category.objects.all()
            
            # Search in name and description
            search = request.query_params.get('search')
            if search:
                queryset = queryset.filter(
                    Q(name__icontains=search) 
                )
            
            # Order by usage frequency (most used first)
            queryset = queryset.order_by('-usage_frequency', 'name')
            
            serializer = CategorySerializer(queryset, many=True)
            return Response({
                'success': True,
                'data': serializer.data,
                'count': queryset.count()
            }, status=status.HTTP_200_OK)
        
        except Exception as ex:
            print(f"Error retrieving categories: {str(ex)}")
            return Response({
                'success': False,
                'message': 'Failed to retrieve categories',
                'data': []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @staticmethod
    def create_category(request):
        """Create a new category"""
        try:
            serializer = CategorySerializer(data=request.data)
            if serializer.is_valid():
                try:
                    with transaction.atomic():
                        category = serializer.save()
                        return Response({
                            'success': True,
                            'message': 'Category created successfully',
                            'data': serializer.data
                        }, status=status.HTTP_201_CREATED)
                except Exception as e:
                    print(f"Error creating category: {str(e)}")
                    return Response({
                        'success': False,
                        'message': 'Failed to create category'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            return Response({
                'success': False,
                'message': 'Validation failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as ex:
            print(f"Error in create_category: {str(ex)}")
            return Response({
                'success': False,
                'message': 'Failed to create category'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
