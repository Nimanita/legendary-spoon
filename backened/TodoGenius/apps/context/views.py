from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .operations import ContextOperations


@api_view(['GET', 'POST'])
def context_list(request):
    """
    GET: List all context entries with optional filtering
    POST: Create a new context entry
    """
    if request.method == 'GET':
        return ContextOperations.get_all_contexts(request)
    elif request.method == 'POST':
        return ContextOperations.create_context(request)



@api_view(['POST'])
def mark_context_processed(request, context_id):
    """
    POST: Mark a context entry as processed
    """
    return ContextOperations.mark_context_processed(context_id)

