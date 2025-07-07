from django.urls import path
from . import views

urlpatterns = [
       # Task endpoints
    path('tasks-list/', views.task_list, name='task-list'),
    path('<uuid:task_id>/', views.task_detail, name='task-detail'),
    path('<uuid:task_id>/complete/', views.mark_task_completed, name='mark-task-completed'),
    path('overdue/', views.overdue_tasks, name='overdue-tasks'),
    path('high-priority/', views.high_priority_tasks, name='high-priority-tasks'),
   
    # Category endpoints
    path('categories/', views.category_list, name='category-list'),
]
