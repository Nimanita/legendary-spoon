from rest_framework import serializers

class TaskEnhancementInputSerializer(serializers.Serializer):
    """Serializer for task enhancement input"""
    task_name = serializers.CharField(max_length=255)

class CategorySerializer(serializers.Serializer):
    """Serializer for category with color validation"""
    name = serializers.CharField(max_length=100)
    color = serializers.CharField(max_length=7)  # Hex color format #RRGGBB
    is_new = serializers.BooleanField(default=False)
    
    def validate_color(self, value):
        """Validate hex color format"""
        if not re.match(r'^#[0-9A-Fa-f]{6}$', value):
            raise serializers.ValidationError("Color must be in hex format (#RRGGBB)")
        return value
    
    def validate_name(self, value):
        """Validate category name"""
        if not value.strip():
            raise serializers.ValidationError("Category name cannot be empty")
        return value.strip().lower()
    
class TaskEnhancementOutputSerializer(serializers.Serializer):
    """Serializer for enhanced task output"""
    title = serializers.CharField(max_length=255)
    descriptions = serializers.CharField(max_length=900)
    category = CategorySerializer(required=False)
    priority_score = serializers.FloatField(min_value=0.0, max_value=1.0)
    deadline = serializers.DateTimeField(allow_null=True, required=False)
    timeframe_days = serializers.IntegerField(min_value=1, required=False)
    confidence = serializers.FloatField(min_value=0.0, max_value=1.0)
    reasoning = serializers.CharField(max_length=500, required=False)
    
    def validate_category(self, value):
        """Additional validation for category object"""
        if value is None:
            return {'name': 'general', 'color': '#3B82F6', 'is_new': True}
        return value
