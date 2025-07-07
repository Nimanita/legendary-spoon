from django.urls import path
from . import views

urlpatterns = [
    # Task AI endpoints
    path('enhance-task/', views.enhance_task, name='enhance_task'),
    
    ]
