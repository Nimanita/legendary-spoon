import uuid
from django.db import models

class Context(models.Model):
    SOURCE_TYPE_CHOICES = [
        ('whatsapp', 'WhatsApp'),
        ('email', 'Email'),
        ('note', 'Note'),
        ('other', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    content = models.TextField()
    source_type = models.CharField(
        max_length=20,
        choices=SOURCE_TYPE_CHOICES,
        default='other'
    )
    is_processed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    context_date = models.DateField(auto_now_add=True)

    class Meta:
        db_table = 'context'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['source_type', 'context_date']),
            models.Index(fields=['is_processed']),
        ]

    def __str__(self):
        content_preview = self.content[:50] + '...' if len(self.content) > 50 else self.content
        return f"{self.get_source_type_display()} - {content_preview}"

    def mark_processed(self):
        self.is_processed = True
        self.save()

