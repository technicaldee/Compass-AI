# Insight Assistant API

This directory contains Next.js API routes for the Mastra-powered Insight Assistant.

## Endpoints

### POST `/api/onboard`

Start the onboarding flow to collect project information.

**Request Body:**
```json
{
  "userInput": "I want to build a tech startup focused on AI",
  "category": "tech" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "templateId": "tech",
    "nextQuestion": "What are your main goals for this project?"
  }
}
```

### POST `/api/onboard/[sessionId]`

Continue the onboarding flow with additional user input.

**Request Body:**
```json
{
  "userInput": "My goal is to create an AI assistant"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "nextQuestion": "Who is the project owner?",
    "isComplete": false
  }
}
```

When complete:
```json
{
  "success": true,
  "data": {
    "isComplete": true,
    "projectId": "uuid"
  }
}
```

### POST `/api/advice/[projectId]`

Generate actionable suggestions for a project.

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "headline": "Project insights generated",
      "confidence": 0.8,
      "basedOn": ["project data", "GitHub", "News"]
    },
    "suggestions": [
      {
        "suggestion": "Consider using modern AI frameworks",
        "reason": "Based on trending GitHub repositories",
        "source": "GitHub"
      }
    ],
    "metadata": {
      "agentsInvolved": ["advisory-agent"],
      "dataSourcesUsed": ["GitHub", "News"],
      "processingTime": 1234
    }
  }
}
```

### GET `/api/advice/[projectId]`

Retrieve existing insights for a project.

**Response:**
Same as POST `/api/advice/[projectId]` response.

## Architecture

- **Agents**: Located in `lib/agents/` - Template Matcher, Data Collector, Validator, Advisory
- **Flows**: Located in `lib/flows/` - Onboarding Flow, Advisory Flow
- **Tools**: Located in `lib/tools/` - GitHub, News, Weather data sources
- **Memory**: In-memory storage for projects and insights (in `lib/memory.ts`)

## Environment Variables

- `NEXT_PUBLIC_GOOGLE_AI`: Google AI API key (required)

