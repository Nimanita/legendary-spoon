LM_STUDIO_BASE_URL = "http://localhost:1234/v1"
MAX_TOKENS = 400
TEMPERATURE = 0.7
MODEL_NAME = "qwen2.5-coder-1.5b-instruct"

# Priority Score Ranges
PRIORITY_RANGES = {
    'low': (0.0, 0.3),
    'medium': (0.3, 0.7),
    'high': (0.7, 1.0)
}


# Context Source Types
CONTEXT_SOURCES = {
    'whatsapp': 'WhatsApp Message',
    'email': 'Email',
    'notes': 'Personal Notes'
}

# Deadline Suggestion Timeframes
DEADLINE_TIMEFRAMES = {
    'urgent': 1,      # 1 day
    'short': 3,       # 3 days
    'medium': 7,      # 1 week
    'long': 14,       # 2 weeks
    'extended': 30    # 1 month
}