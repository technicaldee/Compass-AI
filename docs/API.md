# API Reference

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

Currently, the API does not require authentication. In production, implement API key or OAuth2 authentication.

## Response Format

All responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE"
  }
}
```

## Error Codes

- `VALIDATION_ERROR`: Request validation failed
- `NOT_FOUND`: Resource not found
- `EXTERNAL_API_ERROR`: External API call failed
- `INTERNAL_ERROR`: Internal server error

## Endpoints

### Onboarding

#### POST /onboard

Start the onboarding flow.

**Request Body**:
```json
{
  "userInput": "I want to build a tech startup",
  "category": "tech"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid-here",
    "templateId": "tech-startup",
    "nextQuestion": "What are your main goals?"
  }
}
```

#### POST /onboard/:sessionId

Continue the onboarding flow.

**Request Body**:
```json
{
  "userInput": "My goal is to launch an MVP"
}
```

**Response**:
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
    "projectId": "uuid-here"
  }
}
```

### Projects

#### GET /projects

List all projects (currently returns empty array - in production would support pagination).

**Response**:
```json
{
  "success": true,
  "data": []
}
```

#### GET /projects/:id

Get a specific project.

**Response**:
```json
{
  "success": true,
  "data": {
    "projectName": "My Project",
    "category": "tech",
    "goals": [...],
    "owner": {...},
    "metadata": {...}
  }
}
```

#### POST /projects/:id/refine

Refine insights with updated project data.

**Request Body**:
```json
{
  "goals": [
    {
      "id": "goal-1",
      "description": "Updated goal",
      "priority": "high",
      "measurable": true
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "summary": {...},
    "recommendations": [...],
    "risks": [...],
    "actionPlan": [...]
  }
}
```

#### GET /projects/:id/reasoning

Get the reasoning path for a project's insights.

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "agent": "analyzer",
      "step": 1,
      "reasoning": "Analysis completed",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /projects/:id/feedback

Submit feedback to improve the system.

**Request Body**:
```json
{
  "feedback": "The recommendations were helpful",
  "rating": 5
}
```

**Response**:
```json
{
  "success": true,
  "message": "Feedback received",
  "data": {
    "projectId": "uuid-here",
    "feedback": "...",
    "rating": 5
  }
}
```

### Advice

#### POST /advice/:projectId

Generate insights for a project.

**Response**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "headline": "Strategic insights for My Project",
      "confidence": 0.85,
      "basedOn": [...]
    },
    "recommendations": [
      {
        "id": "rec-1",
        "title": "...",
        "description": "...",
        "priority": 1,
        "category": "quick-win",
        "confidence": 0.9,
        "reasoning": "...",
        "supportingData": [...],
        "alternatives": []
      }
    ],
    "risks": [...],
    "actionPlan": [...],
    "metadata": {
      "agentsInvolved": [...],
      "dataSourcesUsed": [...],
      "processingTime": 2345,
      "reasoningPath": [...]
    }
  }
}
```

#### GET /advice/:projectId

Get existing insights for a project.

**Response**: Same as POST /advice/:projectId

### Templates

#### GET /templates

List available templates.

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "tech-startup",
      "name": "Tech Startup",
      "category": ["tech", "business"],
      "description": "...",
      "requiredFields": [...]
    }
  ]
}
```

#### POST /templates

Create a custom template (stub - not persisted).

**Request Body**:
```json
{
  "id": "custom-template",
  "name": "Custom Template",
  "category": ["tech"],
  "description": "...",
  "requiredFields": [...]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Template created (stub - not persisted)",
  "data": {...}
}
```

### Health & Metrics

#### GET /health

Health check endpoint.

**Response**:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "cache": {
    "hits": 100,
    "misses": 50,
    "keys": 25
  },
  "metrics": {
    "total": 1000,
    "recent": [...]
  }
}
```

#### GET /health/metrics

Get detailed system metrics.

**Response**:
```json
{
  "success": true,
  "data": {
    "metrics": [...],
    "cache": {...}
  }
}
```

## Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: Rate limit info included in response headers
- **Status Code**: 429 Too Many Requests when limit exceeded

## Example Usage

### Complete Workflow

```bash
# 1. Start onboarding
SESSION_ID=$(curl -X POST http://localhost:3000/api/v1/onboard \
  -H "Content-Type: application/json" \
  -d '{"userInput": "Tech startup", "category": "tech"}' \
  | jq -r '.data.sessionId')

# 2. Continue onboarding
curl -X POST http://localhost:3000/api/v1/onboard/$SESSION_ID \
  -H "Content-Type: application/json" \
  -d '{"userInput": "Launch MVP in 3 months"}'

# 3. Get project ID (after completion)
PROJECT_ID="..." # From onboarding response

# 4. Generate insights
curl -X POST http://localhost:3000/api/v1/advice/$PROJECT_ID

# 5. Get insights
curl http://localhost:3000/api/v1/advice/$PROJECT_ID
```

## Status Codes

- `200`: Success
- `400`: Bad Request (validation error)
- `404`: Not Found
- `429`: Too Many Requests
- `500`: Internal Server Error
- `502`: Bad Gateway (external API error)

