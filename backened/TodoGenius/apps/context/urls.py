from django.urls import path
from . import views


urlpatterns = [
    # Context CRUD operations
    path('', views.context_list, name='context-list'),
    path('<uuid:context_id>/mark-processed/', views.mark_context_processed, name='mark-context-processed'),
    ]