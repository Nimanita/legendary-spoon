# TodoGenius 🧠✅

## Intelligent Task Management System with AI-Powered Context Analysis

TodoGenius is a sophisticated full-stack web application that revolutionizes task management through AI-driven insights, intelligent prioritization, and context-aware recommendations. Built with Django REST Framework, React.js, and powered by LM Studio's local AI capabilities, it transforms how users interact with their daily tasks.

---

## 🚀 Overview

TodoGenius combines traditional task management with cutting-edge AI technology to provide:
- **Intelligent Task Enhancement**: AI-powered task descriptions and categorization
- **Smart Prioritization**: Context-aware priority scoring based on user's daily activities
- **Deadline Suggestions**: Realistic deadline recommendations considering task complexity
- **Context Integration**: Analysis of daily context (WhatsApp messages, emails, notes) for better task management
- **Real-time AI Processing**: Seamless integration with local LM Studio for privacy-focused AI operations

---

## 🏗️ System Architecture

### High-Level Architecture Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │    │                 │
│   Frontend      │───▶│   Debouncing    │───▶│   Backend API   │───▶│   LM Studio     │
│   (React.js)     │    │   Layer         │    │   (Django)      │    │   (Local AI)    │
│                 │    │                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                                             │                        │
         │                                             ▼                        │
         │              ┌─────────────────┐    ┌─────────────────┐             │
         │              │                 │    │                 │             │
         └──────────────│   User          │◀───│   AI Response   │◀────────────┘
                        │   Confirmation  │    │   Processing    │
                        │                 │    │                 │
                        └─────────────────┘    └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │                 │
                        │   Supabase      │
                        │   Database      │
                        │                 │
                        └─────────────────┘
```

### Detailed Workflow

#### 1. User Input Phase
- User types task information in the frontend interface
- Debouncing mechanism (300ms delay) prevents excessive API calls
- Real-time validation ensures data integrity

#### 2. Backend Processing Phase
- Django REST API receives the task creation request
- **TaskProcessor** service is invoked with comprehensive context:
  - Recent tasks (last 10) with category colors
  - Daily context entries (last 24 hours)
  - Existing categories with usage frequencies
  - User preferences and task load

#### 3. AI Enhancement Phase
- **LMStudioClient** formats a comprehensive prompt including:
  - Task details and user input
  - Historical task patterns
  - Current context from messages/emails/notes
  - Available categories and colors
- Local LM Studio processes the prompt using advanced language models
- AI generates enhanced task suggestions with:
  - Improved descriptions (3 variations)
  - Smart categorization with color coding
  - Priority scoring (0.0-1.0)
  - Deadline recommendations
  - Confidence ratings

#### 4. Response Processing Phase
- Backend validates and sanitizes AI response
- **DataFormatter** ensures proper JSON structure
- Category processing handles both existing and new categories
- Color assignment prevents duplicates

#### 5. User Confirmation Phase
- Frontend displays AI-enhanced suggestions
- User can accept, modify, or reject recommendations
- **Only upon user confirmation** is the task saved to Supabase
- Category usage frequencies are updated for better future suggestions

---

## 🛠️ Technical Stack

### Backend
- **Framework**: Django 4.2+ with REST Framework
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: LM Studio (Local LLM hosting)
- **Authentication**: Django's built-in authentication
- **API Documentation**: OpenAPI/Swagger

### Frontend
- **Framework**: React.js 13+ with App Router
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useEffect)
- **HTTP Client**: Axios with interceptors
- **UI Components**: Custom components with Tailwind

### AI & ML
- **Local LLM**: LM Studio with Llama/Mistral models
- **Context Processing**: Custom NLP pipeline
- **Priority Algorithm**: Multi-factor scoring system
- **Categorization**: Semantic similarity matching

---

## 📁 Project Structure

```TodoGenius/
├── backend/
│   └── TodoGenius/
│       ├── TodoGenius/                 # Django project settings
│       │   ├── __init__.py
│       │   ├── settings.py
│       │   ├── urls.py
│       │   └── wsgi.py
│       │
│       ├── apps/                      # Django apps directory
│       │   ├── __init__.py
│       │   │
│       │   ├── tasks/                 # Task management app
│       │   │   ├── __init__.py
│       │   │   ├── models.py          # Task and Category models
│       │   │   ├── serializers.py     # DRF serializers
│       │   │   ├── views.py           # API endpoints
│       │   │   ├── urls.py            # URL routing
│       │   │   ├── operations.py      # Business logic
│       │   │   └── admin.py           # Django admin
│       │   │
│       │   ├── context/               # Context management app
│       │   │   ├── __init__.py
│       │   │   ├── models.py          # Context model
│       │   │   ├── serializers.py     # Context serializers
│       │   │   ├── views.py           # Context API endpoints
│       │   │   ├── urls.py            # Context URLs
│       │   │   └── admin.py           # Context admin
│       │  
│       ├── aiengine/              # AI processing app
│       │       ├── __init__.py
│       │       ├── models.py          # AI-related models
│       │       ├── serializers.py     # AI serializers
│       │       ├── views.py           # AI API endpoints
│       │       ├── urls.py            # AI URLs
│       │       ├── constants.py       # AI constants
│       │       ├── admin.py           # AI admin
│       │       │
│       │       ├── services/          # AI business logic
│       │       │   ├── __init__.py
│       │       │   ├── task_processor.py  # Main AI processing
│       │       │   └── lm_studio_client.py # llama-cpp integration
│       │       │
│       │       └── utils/             # AI utilities
│       │           ├── __init__.py
│       │           ├── prompt_templates.py # AI prompts
│       │           └── data_formatter.py  # Response formatting
│       │
│       ├── requirements.txt           # Python dependencies
│       └── manage.py                  # Django management
│
├── frontend/
│   ├── src/
│   │   ├── app/                      # Next.js app directory
│   │   │   ├── layout.tsx            # Root layout
│   │   │   ├── page.tsx              # Home page
│   │   │   ├── tasks/                # Task pages
│   │   │   └── context/              # Context pages
│   │   │
│   │   ├── components/               # Reusable components
│   │   │   ├── TaskList.tsx          # Task list component
│   │   │   ├── TaskForm.tsx          # Task creation form
│   │   │   ├── AIEnhancementModal.tsx # AI suggestions modal
│   │   │   └── ContextInput.tsx      # Context input component
│   │   │
│   │   ├── lib/                      # Utility functions
│   │   │   ├── api.ts                # API client
│   │   │   ├── types.ts              # TypeScript types
│   │   │   └── utils.ts              # Helper functions
│   │   │
│   │   └── styles/                   # Styling
│   │       └── globals.css           # Global styles
│   │
│   ├── package.json                  # Node.js dependencies
│   └── tailwind.config.js            # Tailwind configuration
│
├── README.md                         # This file
└── .gitignore                        # Git ignore rules
```

---

## 🗄️ Database Schema

### Tasks Table
```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    is_ai_enhanced BOOLEAN DEFAULT FALSE,
    deadline TIMESTAMP,
    is_ai_suggested_deadline BOOLEAN DEFAULT FALSE,
    priority_score DECIMAL(3,2) DEFAULT 0.5 CHECK (priority_score >= 0.0 AND priority_score <= 1.0),
    category_id UUID REFERENCES categories(id),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);
```

### Categories Table
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    usage_frequency INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Context Table
```sql
CREATE TABLE context (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    source_type VARCHAR(20) DEFAULT 'other',
    is_processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    context_date DATE DEFAULT CURRENT_DATE
);
```

---

## 🔧 Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 18+
- LM Studio application
- Supabase account

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/TodoGenius.git
cd TodoGenius/backend/TodoGenius
```

2. **Create virtual environment**
```bash
python -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**
```bash
# Create .env file in backend/TodoGenius/
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
LM_STUDIO_BASE_URL=http://localhost:1234/v1
AI_MODEL_NAME=your_model_name
AI_MAX_TOKENS=2000
AI_TEMPERATURE=0.7
DEBUG=True
```

5. **Setup database**
```bash
python manage.py migrate
python manage.py collectstatic
```

6. **Create superuser**
```bash
python manage.py createsuperuser
```

7. **Start development server**
```bash
python manage.py runserver
```

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd ../../frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
# Create .env.local file
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME=TodoGenius
```

4. **Start development server**
```bash
npm run dev
```

### LM Studio Setup

1. **Download and install LM Studio**
   - Visit https://lmstudio.ai/
   - Download for your platform
   - Install the application

2. **Download a model**
   - Open LM Studio
   - Go to the "Discover" tab
   - Search for and download a model (e.g., "Llama 2 7B Chat")

3. **Start the local server**
   - Go to the "Local Server" tab
   - Select your downloaded model
   - Start the server (default port: 1234)

---

## 🎯 Key Features

### AI-Powered Task Enhancement
- **Intelligent Descriptions**: Generates 3 contextually relevant task descriptions
- **Smart Categorization**: Automatically suggests appropriate categories with color coding
- **Priority Scoring**: Calculates priority based on context, urgency, and importance
- **Deadline Suggestions**: Recommends realistic deadlines based on task complexity

### Context-Aware Intelligence
- **Daily Context Analysis**: Processes WhatsApp messages, emails, and notes
- **Pattern Recognition**: Identifies recurring themes and priorities
- **Sentiment Analysis**: Understands urgency and importance from context
- **Historical Learning**: Improves suggestions based on user behavior

### Advanced Task Management
- **Multi-level Filtering**: Filter by status, category, priority, deadline
- **Smart Search**: Search across titles and descriptions
- **Batch Operations**: Mark multiple tasks as completed
- **Export/Import**: JSON and CSV support for task data

### User Experience
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Updates**: Instant feedback on AI processing
- **Debounced Inputs**: Optimized API calls with smart debouncing
- **Loading States**: Clear indicators for AI processing

---

## 🔄 AI Processing Pipeline

### 1. Context Collection
```python
# Collect recent tasks with categories and colors
recent_tasks = get_recent_tasks(limit=10)

# Gather daily context from last 24 hours
recent_context = get_daily_context(hours=24)

# Fetch existing categories with usage frequencies
existing_categories = get_existing_categories()
```

### 2. Prompt Engineering
```python
# Build comprehensive prompt with all context
prompt = build_enhancement_prompt(
    task_name=user_input,
    recent_tasks=recent_tasks,
    daily_context=recent_context,
    existing_categories=existing_categories
)
```

### 3. AI Processing
```python
# Send to LM Studio for processing
response = lm_studio_client.generate_completion(
    prompt=prompt,
    max_tokens=2000,
    temperature=0.7
)
```

### 4. Response Validation
```python
# Parse and validate AI response
enhanced_data = parse_ai_response(response)
sanitized_data = sanitize_response(enhanced_data)
validated_data = validate_response_structure(sanitized_data)
```

### 5. Category Processing
```python
# Handle category assignment and color management
processed_data = process_category_with_color(
    validated_data,
    existing_categories
)
```

---

## 📊 API Documentation

### Task Endpoints

#### Get All Tasks
```http
GET /api/tasks/
```

**Query Parameters:**
- `status` (optional): Filter by task status
- `category` (optional): Filter by category ID
- `priority_min` (optional): Minimum priority score
- `priority_max` (optional): Maximum priority score
- `search` (optional): Search in title and description
- `overdue` (optional): Filter overdue tasks (true/false)

**Response:**
```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "title": "Complete project documentation",
      "description": "Write comprehensive documentation for the project",
      "is_ai_enhanced": true,
      "deadline": "2024-07-15T10:00:00Z",
      "priority_score": 0.8,
      "category": {
        "id": "uuid",
        "name": "work",
        "color": "#3B82F6"
      },
      "status": "pending",
      "created_at": "2024-07-08T12:00:00Z"
    }
  ],
  "count": 1
}
```

#### Create Task with AI Enhancement
```http
POST /api/ai/enhance-task/
```

**Request Body:**
```json
{
  "task_name": "Prepare presentation for client meeting"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Prepare presentation for client meeting",
    "descriptions": [
      "Create a comprehensive presentation covering project milestones, deliverables, and next steps for the upcoming client meeting",
      "Develop slide deck with key project updates, success metrics, and future roadmap for client presentation",
      "Prepare detailed presentation materials including project status, achievements, and strategic recommendations for client review"
    ],
    "category": {
      "name": "work",
      "color": "#3B82F6",
      "is_new": false
    },
    "priority_score": 0.8,
    "timeframe_days": 2,
    "suggested_deadline": "2024-07-10T12:00:00Z",
    "confidence": 0.9,
    "reasoning": "High priority due to client involvement and upcoming meeting timeline"
  }
}
```

#### Create Task (After User Confirmation)
```http
POST /api/tasks/
```

**Request Body:**
```json
{
  "title": "Prepare presentation for client meeting",
  "description": "Create a comprehensive presentation covering project milestones, deliverables, and next steps for the upcoming client meeting",
  "category_name": "work",
  "category_color": "#3B82F6",
  "priority_score": 0.8,
  "deadline": "2024-07-10T12:00:00Z",
  "is_ai_enhanced": true,
  "is_ai_suggested_deadline": true
}
```

### Context Endpoints

#### Add Daily Context
```http
POST /api/context/
```

**Request Body:**
```json
{
  "content": "Meeting with John at 3 PM about project timeline",
  "source_type": "note",
  "context_date": "2024-07-08"
}
```

#### Get Daily Context
```http
GET /api/context/
```

**Query Parameters:**
- `date` (optional): Filter by specific date
- `source_type` (optional): Filter by source type
- `processed` (optional): Filter by processing status

---

## 🎨 Frontend Components

### TaskList Component
```typescript
interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  loading: boolean;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onTaskUpdate,
  onTaskDelete,
  loading
}) => {
  // Component implementation
};
```

### AIEnhancementModal Component
```typescript
interface AIEnhancementModalProps {
  isOpen: boolean;
  onClose: () => void;
  enhancedData: AIEnhancedTask;
  onAccept: (data: AIEnhancedTask) => void;
  onReject: () => void;
}

const AIEnhancementModal: React.FC<AIEnhancementModalProps> = ({
  isOpen,
  onClose,
  enhancedData,
  onAccept,
  onReject
}) => {
  // Modal implementation with AI suggestions
};
```

---

## 🔍 Advanced Features

### Smart Debouncing
```typescript
const useDebouncedCallback = (callback: Function, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback((...args: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};
```

### Context Analysis Algorithm
```python
def analyze_context_for_priority(context_entries, task_name):
    """
    Analyze daily context to determine task priority
    """
    priority_indicators = {
        'urgency_keywords': ['urgent', 'asap', 'deadline', 'today'],
        'importance_keywords': ['important', 'critical', 'priority', 'essential'],
        'meeting_keywords': ['meeting', 'call', 'presentation', 'demo'],
        'project_keywords': ['project', 'delivery', 'milestone', 'launch']
    }
    
    base_score = 0.5
    context_boost = 0.0
    
    for entry in context_entries:
        content_lower = entry.content.lower()
        
        # Check for urgency indicators
        if any(keyword in content_lower for keyword in priority_indicators['urgency_keywords']):
            context_boost += 0.15
        
        # Check for importance indicators
        if any(keyword in content_lower for keyword in priority_indicators['importance_keywords']):
            context_boost += 0.2
        
        # Check for meeting-related content
        if any(keyword in content_lower for keyword in priority_indicators['meeting_keywords']):
            context_boost += 0.1
        
        # Check for project-related content
        if any(keyword in content_lower for keyword in priority_indicators['project_keywords']):
            context_boost += 0.05
    
    return min(base_score + context_boost, 1.0)
```

---

## 📈 Performance Optimization

### Backend Optimizations
- **Database Indexing**: Strategic indexes on frequently queried fields
- **Query Optimization**: Select_related and prefetch_related for joins
- **Caching**: Redis caching for frequently accessed data
- **Connection Pooling**: Efficient database connection management

### Frontend Optimizations
- **Code Splitting**: Dynamic imports for route-based splitting
- **Lazy Loading**: Lazy loading of components and images
- **Memoization**: React.memo and useMemo for expensive computations
- **Debouncing**: Optimized API calls with smart debouncing

### AI Processing Optimizations
- **Local Processing**: LM Studio for privacy and speed
- **Prompt Optimization**: Efficient prompt engineering
- **Response Caching**: Cache similar AI responses
- **Batch Processing**: Process multiple tasks in batches

---



---

## 📄 Sample Data

### Sample Tasks
```json
[
  {
    "title": "Complete quarterly report",
    "description": "Prepare and submit Q3 financial report",
    "category": "work",
    "priority_score": 0.9,
    "deadline": "2024-07-15T17:00:00Z"
  },
  {
    "title": "Grocery shopping",
    "description": "Buy weekly groceries including fruits and vegetables",
    "category": "personal",
    "priority_score": 0.4,
    "deadline": "2024-07-10T18:00:00Z"
  }
]
```

### Sample Context Entries
```json
[
  {
    "content": "Meeting with Sarah at 2 PM about project timeline",
    "source_type": "note",
    "context_date": "2024-07-08"
  },
  {
    "content": "Urgent: Client needs presentation by Friday",
    "source_type": "email",
    "context_date": "2024-07-08"
  },
  {
    "content": "Don't forget to buy milk on the way home",
    "source_type": "whatsapp",
    "context_date": "2024-07-08"
  }
]
```

---

## 🔮 Future Enhancements

### Planned Features
- **Calendar Integration**: Sync with Google Calendar and Outlook
- **Time Blocking**: Automatic time allocation for tasks
- **Collaborative Tasks**: Team task management
- **Mobile App**: React Native mobile application
- **Voice Input**: Voice-to-text task creation
- **Advanced Analytics**: Task completion patterns and insights

### AI Improvements
- **Fine-tuning**: Custom model fine-tuning for better accuracy
- **Multi-modal Analysis**: Image and document analysis
- **Predictive Scheduling**: ML-based optimal task scheduling
- **Sentiment Analysis**: Emotional context understanding
- **Natural Language Queries**: Conversational task management

---

## 🤝 Contributing

### Development Guidelines
1. Follow PEP 8 style guide for Python code
2. Use TypeScript for all new frontend components
3. Write comprehensive tests for new features
4. Update documentation for API changes
5. Follow semantic versioning for releases

### Pull Request Process
1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Update documentation
5. Submit pull request with detailed description

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **LM Studio**: For providing excellent local LLM hosting
- **Supabase**: For robust backend-as-a-service platform
- **Django REST Framework**: For powerful API development
- **Next.js**: For outstanding React framework
- **Tailwind CSS**: For utility-first styling approach

---

## 📧 Contact

For questions, suggestions, or collaboration opportunities:

- **GitHub**: [TodoGenius Repository]((https://github.com/Nimanita/legendary-spoon/))


---

*Built with ❤️ by the TodoGenius team*
