from rest_framework import serializers
from .models import Task, Category
from django.utils import timezone

class CategorySerializer(serializers.ModelSerializer):
    task_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'color', 'usage_frequency',
            'task_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'usage_frequency', 'created_at', 'updated_at']

    def get_task_count(self, obj):
        return obj.tasks.count()

    def validate_color(self, value):
        """Validate hex color format"""
        if not value.startswith('#') or len(value) != 7:
            raise serializers.ValidationError("Color must be in hex format (e.g., #3B82F6)")
        
        # Check if the rest are valid hex characters
        try:
            int(value[1:], 16)
        except ValueError:
            raise serializers.ValidationError("Invalid hex color format")
        
        return value


class TaskSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    days_until_deadline = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'is_ai_enhanced', 'deadline',
            'is_ai_suggested_deadline', 'priority_score', 'category',
            'category_name', 'category_color', 'status', 'is_overdue',
            'days_until_deadline', 'created_at', 'updated_at', 'completed_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'completed_at']

    def validate_priority_score(self, value):
        """Ensure priority score is between 0.0 and 1.0"""
        if value < 0.0 or value > 1.0:
            raise serializers.ValidationError("Priority score must be between 0.0 and 1.0")
        return value

    def validate_status(self, value):
        """Validate status field"""
        valid_statuses = ['pending', 'in_progress', 'completed', 'cancelled']
        if value not in valid_statuses:
            raise serializers.ValidationError(f"Status must be one of: {', '.join(valid_statuses)}")
        return value

    def update(self, instance, validated_data):
        """Handle status changes and completion tracking"""
        new_status = validated_data.get('status', instance.status)
        
        # If marking as completed, set completed_at
        if new_status == 'completed' and instance.status != 'completed':
            validated_data['completed_at'] = timezone.now()
        # If changing from completed to something else, clear completed_at
        elif new_status != 'completed' and instance.status == 'completed':
            validated_data['completed_at'] = None
            
        return super().update(instance, validated_data)


class TaskCreateSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(
        write_only=True,
        required=True,
        max_length=100
    )
    category_color = serializers.CharField(
        write_only=True,
        required=False,
        default='#3B82F6',
        max_length=7
    )

    class Meta:
        model = Task
        fields = [
            'title',
            'description',
            'deadline',
            'priority_score',
            'category_name',
            'category_color',
        ]

    def validate_priority_score(self, value):
        if not (0.0 <= value <= 1.0):
            raise serializers.ValidationError("Priority score must be between 0.0 and 1.0")
        return value

    def create(self, validated_data):
        # Pull out category inputs
        name = validated_data.pop('category_name').strip()
        color = validated_data.pop('category_color', '#3B82F6').strip()

        # Get or create the category (case‐insensitive lookup)
        category, _ = Category.objects.get_or_create(
            name__iexact=name,
            defaults={'name': name, 'color': color}
        )

        # Assign and create the Task
        validated_data['category'] = category
        return super().create(validated_data)



class TaskUpdateSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(
        write_only=True, required=False, max_length=100
    )
    category_color = serializers.CharField(
        write_only=True, required=False, default='#3B82F6', max_length=7
    )

    class Meta:
        model = Task
        fields = [
            'title',
            'description',
            'deadline',
            'priority_score',
            'status',
            'category_name',
            'category_color',
        ]

    def validate_priority_score(self, value):
        if not (0.0 <= value <= 1.0):
            raise serializers.ValidationError(
                "Priority score must be between 0.0 and 1.0"
            )
        return value

    def validate_status(self, value):
        valid = ['pending', 'in_progress', 'completed', 'cancelled']
        if value not in valid:
            raise serializers.ValidationError(
                f"Status must be one of: {', '.join(valid)}"
            )
        return value

    def update(self, instance, validated_data):
        # 1. Handle category lookup/creation
        name = validated_data.pop('category_name', None)
        color = validated_data.pop('category_color', None)
        if name:
            name = name.strip()
            color = (color or '#3B82F6').strip()
            category, _ = Category.objects.get_or_create(
                name__iexact=name,
                defaults={'name': name, 'color': color}
            )
            instance.category = category

        # 2. Update the rest of the fields
        for attr, val in validated_data.items():
            setattr(instance, attr, val)

        # 3. Manage completed_at timestamp
        if 'status' in validated_data:
            if instance.status == 'completed' and not instance.completed_at:
                instance.completed_at = timezone.now()
            elif instance.status != 'completed':
                instance.completed_at = None

        instance.save()
        return instance
