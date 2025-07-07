from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .operations import TaskOperations, CategoryOperations


# Task Views
@api_view(['GET', 'POST'])
#@permission_classes([IsAuthenticated])
def task_list(request):
    """
    GET: List all tasks with optional filtering
    POST: Create a new task
    """
    if request.method == 'GET':
        return TaskOperations.get_all_tasks(request)
    elif request.method == 'POST':
        return TaskOperations.create_task(request)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
#@permission_classes([IsAuthenticated])
def task_detail(request, task_id):
    """
    GET: Retrieve a specific task
    PUT/PATCH: Update a specific task
    DELETE: Delete a specific task
    """
    if request.method == 'GET':
        return TaskOperations.get_task_by_id(task_id)
    elif request.method in ['PUT', 'PATCH']:
        return TaskOperations.update_task(task_id, request)
    elif request.method == 'DELETE':
        return TaskOperations.delete_task(task_id)


@api_view(['POST'])
#@permission_classes([IsAuthenticated])
def mark_task_completed(request, task_id):
    """
    POST: Mark a task as completed
    """
    return TaskOperations.mark_task_completed(task_id)


@api_view(['GET'])
#@permission_classes([IsAuthenticated])
def overdue_tasks(request):
    """
    GET: Get all overdue tasks
    """
    return TaskOperations.get_overdue_tasks()


@api_view(['GET'])
#@permission_classes([IsAuthenticated])
def high_priority_tasks(request):
    """
    GET: Get all high priority tasks (>= 0.7)
    """
    return TaskOperations.get_high_priority_tasks()



# Category Views
@api_view(['GET', 'POST'])
#@permission_classes([IsAuthenticated])
def category_list(request):
    """
    GET: List all categories with task counts
    POST: Create a new category
    """
    if request.method == 'GET':
        return CategoryOperations.get_all_categories(request)
    elif request.method == 'POST':
        return CategoryOperations.create_category(request)

