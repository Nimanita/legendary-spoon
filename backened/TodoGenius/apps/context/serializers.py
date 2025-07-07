from rest_framework import serializers
from .models import Context


class ContextSerializer(serializers.ModelSerializer):
    source_type_display = serializers.CharField(source='get_source_type_display', read_only=True)
    
    class Meta:
        model = Context
        fields = [
            'id', 'content', 'source_type', 'source_type_display',
            'is_processed', 'created_at', 'context_date'
        ]
        read_only_fields = ['id', 'is_processed', 'created_at', 'context_date']

    def validate_source_type(self, value):
        """Validate source type"""
        valid_types = ['whatsapp', 'email', 'note', 'other']
        if value not in valid_types:
            raise serializers.ValidationError(f"Source type must be one of: {', '.join(valid_types)}")
        return value

    def validate_content(self, value):
        """Validate content is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Content cannot be empty")
        return value.strip()


class ContextCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for context entry creation"""
    
    class Meta:
        model = Context
        fields = ['content', 'source_type']
        
    def validate_content(self, value):
        """Validate content is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Content cannot be empty")
        return value.strip()


class ContextUpdateSerializer(serializers.ModelSerializer):
    """Serializer for context entry updates"""
    
    class Meta:
        model = Context
        fields = ['content', 'source_type', 'is_processed']
        
    def validate_content(self, value):
        """Validate content is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Content cannot be empty")
        return value.strip()