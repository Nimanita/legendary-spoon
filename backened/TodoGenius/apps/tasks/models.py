# apps/tasks/models.py
import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from datetime import date, timedelta


class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    color = models.CharField(max_length=7, default='#3B82F6')
    usage_frequency = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'categories'
        ordering = ['-usage_frequency', 'name']
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name

    def increment_usage(self):
        self.usage_frequency += 1
        self.save()


class Task(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    is_ai_enhanced = models.BooleanField(default=False)
    deadline = models.DateTimeField(blank=True, null=True)
    is_ai_suggested_deadline = models.BooleanField(default=False)
    priority_score = models.FloatField(
        default=0.5,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='tasks'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'tasks'
        ordering = ['-priority_score', 'created_at']
        indexes = [
            models.Index(fields=['status', 'priority_score']),
            models.Index(fields=['deadline']),
            models.Index(fields=['category']),
        ]

    def __str__(self):
        return self.title

    @property
    def is_overdue(self):
        if self.deadline and self.status != 'completed':
            return timezone.now() > self.deadline
        return False

    @property
    def days_until_deadline(self):
        if self.deadline:
            delta = self.deadline.date() - date.today()
            return delta.days
        return None

    def mark_completed(self):
        self.status = 'completed'
        self.completed_at = timezone.now()
        self.save()

    def save(self, *args, **kwargs):
        # Clamp priority_score to [0.0, 1.0]
        if self.priority_score < 0.0:
            self.priority_score = 0.0
        elif self.priority_score > 1.0:
            self.priority_score = 1.0
        
        super().save(*args, **kwargs)
        
        # Increment category usage if category is assigned
        if self.category:
            self.category.increment_usage()



