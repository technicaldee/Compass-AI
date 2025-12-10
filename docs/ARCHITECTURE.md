# Architecture Deep Dive

## Overview

The Mastra Insight Assistant is built with a modular, agent-based architecture that emphasizes separation of concerns, extensibility, and production readiness.

## Core Principles

1. **Single Responsibility**: Each agent, tool, and flow has one clear purpose
2. **Composition over Inheritance**: Complex behaviors emerge from composing simple agents
3. **Fail Gracefully**: Every component handles errors and provides fallbacks
4. **Observability First**: Logging, metrics, and tracing built into every layer
5. **Type Safety**: Full TypeScript with strict mode and Zod validation

## System Layers

### 1. API Layer

**Location**: `src/api/`

**Responsibilities**:
- HTTP request handling
- Request validation
- Rate limiting
- Error formatting
- Response serialization

**Key Components**:
- `server.ts`: Express app setup and middleware
- `routes/`: Route handlers for different resources
- `middleware/`: Request logging, error handling
- `validators/`: Request validation using Zod

**Design Decisions**:
- RESTful API design for clarity
- Versioned endpoints (`/api/v1/`)
- Consistent error response format
- Request ID tracking for debugging

### 2. Flow Layer

**Location**: `src/flows/`

**Responsibilities**:
- Orchestrating multiple agents
- Managing flow state
- Error recovery
- Parallel execution coordination

**Flows**:

#### Onboarding Flow
- **Purpose**: Guide users through project setup
- **Agents Used**: Template Matcher, Data Collector, Validator
- **Pattern**: Sequential with validation checkpoints
- **State Management**: Session-based with incremental collection

#### Advisory Flow
- **Purpose**: Generate comprehensive insights
- **Agents Used**: Analyzer, Strategist, Tactical, Risk, Synthesizer
- **Pattern**: Parallel analysis → Sequential refinement → Synthesis
- **State Management**: Project-based with caching

#### Refinement Flow
- **Purpose**: Update insights based on new data
- **Agents Used**: Reuses Advisory Flow
- **Pattern**: Update → Regenerate → Compare
- **State Management**: Versioned insights

**Design Decisions**:
- Flows are stateless (state stored in memory layer)
- Checkpoint support for long-running operations
- Parallel execution where possible
- Graceful degradation if agents fail

### 3. Agent Layer

**Location**: `src/agents/`

**Responsibilities**:
- Domain-specific reasoning
- Structured output generation
- Confidence scoring
- Error handling

**Agent Categories**:

#### Onboarding Agents
- **Template Matcher**: Analyzes input and recommends templates
- **Data Collector**: Progressive data collection with context awareness
- **Validator**: Validates completeness and quality

#### Advisory Agents
- **Analyzer**: SWOT-style analysis (patterns, strengths, weaknesses, opportunities, threats)
- **Strategist**: High-level strategic recommendations
- **Tactical**: Breaks strategies into actionable steps
- **Risk**: Identifies risks and mitigation strategies
- **Synthesizer**: Combines all perspectives into coherent report

**Design Decisions**:
- Each agent has a clear input/output contract
- Agents return structured responses with confidence scores
- Agents are independent and testable
- Reasoning is transparent (agents explain their outputs)

### 4. Tool Layer

**Location**: `src/tools/`

**Responsibilities**:
- External API integration
- Data fetching and caching
- Relevance scoring
- Error handling and retries

**Tools**:

#### GitHub Tool
- **Purpose**: Fetch trending repositories
- **Relevance**: High for tech projects
- **Caching**: 1 hour TTL
- **Fallback**: Mock data if API fails

#### News Tool
- **Purpose**: Fetch relevant news articles
- **Relevance**: High for business/finance projects
- **Caching**: 30 minutes TTL
- **Fallback**: Mock data if API fails

#### Weather Tool
- **Purpose**: Fetch weather data for event planning
- **Relevance**: High for community projects
- **Caching**: 30 minutes TTL
- **Fallback**: Mock data if API fails

**Design Decisions**:
- Tools implement a common interface (`DataTool`)
- Relevance scoring determines tool selection
- Caching reduces API calls
- Graceful degradation with fallbacks
- Rate limiting and retry logic

### 5. Memory Layer

**Location**: `src/memory/`

**Responsibilities**:
- Project persistence
- Conversation context
- Caching strategy
- Memory cleanup

**Memory Types**:

#### Project Memory
- **Purpose**: Store project data and insights
- **Storage**: In-memory cache (production would use database)
- **TTL**: Configurable per item
- **Access**: By project ID

#### Conversation Memory
- **Purpose**: Maintain conversation context
- **Storage**: In-memory cache
- **TTL**: 1 hour
- **Access**: By session ID
- **Limits**: Max 50 messages per conversation

#### Cache Manager
- **Purpose**: Centralized caching with TTL
- **Implementation**: node-cache
- **Features**: Automatic expiration, statistics
- **Monitoring**: Cache hit/miss metrics

**Design Decisions**:
- Memory is abstracted behind interfaces
- Easy to swap implementations (e.g., Redis for production)
- Memory cleanup prevents leaks
- Statistics for monitoring

### 6. Configuration Layer

**Location**: `src/config/`

**Responsibilities**:
- Environment variable management
- Agent configuration
- Tool configuration
- Feature flags

**Design Decisions**:
- Centralized configuration
- Type-safe config objects
- Environment-specific settings
- Easy to extend

## Data Flow

### Onboarding Flow

```
User Input
    ↓
Template Matcher Agent → Template ID
    ↓
Data Collector Agent → Partial Project Data
    ↓
Validator Agent → Validation Result
    ↓
Project Memory → Saved Project
    ↓
Project ID Returned
```

### Advisory Flow

```
Project ID
    ↓
Project Memory → Project Data
    ↓
┌─────────────────┬──────────────────┐
│                 │                  │
Analyzer Agent    External Data      │
    │            Tools               │
    │            │                   │
    └────────────┴───────────────────┘
            ↓
    Strategist Agent
            ↓
    Tactical Agent
            ↓
    Risk Agent
            ↓
    Synthesizer Agent
            ↓
    Insight Report
            ↓
    Project Memory → Saved Insights
```

## Error Handling Strategy

1. **Agent Level**: Each agent catches errors and returns structured error responses
2. **Flow Level**: Flows handle agent failures and provide fallbacks
3. **API Level**: Middleware catches all errors and formats responses
4. **Tool Level**: Tools retry on failure and provide fallback data

## Performance Optimizations

1. **Caching**: Aggressive caching of external data and insights
2. **Parallel Execution**: Agents run in parallel where possible
3. **Lazy Loading**: Data fetched only when needed
4. **Connection Pooling**: Reuse HTTP connections
5. **Request Batching**: Batch similar requests

## Security Considerations

1. **Input Validation**: All inputs validated with Zod schemas
2. **Rate Limiting**: Prevents abuse
3. **Error Messages**: Don't leak sensitive information
4. **API Keys**: Stored in environment variables
5. **CORS**: Properly configured
6. **Helmet**: Security headers

## Scalability Considerations

1. **Stateless Design**: Easy to scale horizontally
2. **Database Ready**: Memory layer can be swapped for database
3. **Queue Support**: Flows designed for async processing
4. **Caching**: Reduces load on external APIs
5. **Monitoring**: Metrics enable performance tuning

## Testing Strategy

1. **Unit Tests**: Each agent, tool, and flow tested independently
2. **Integration Tests**: Test flows end-to-end
3. **Mock External APIs**: Tools use mocks in tests
4. **Test Coverage**: Target 80%+ coverage

## Future Enhancements

1. **Vector Database**: For semantic memory and similarity search
2. **WebSocket Support**: Real-time progress updates
3. **Plugin System**: Easy to add custom agents/tools
4. **Multi-Tenancy**: Support multiple users/organizations
5. **A/B Testing**: Test different prompting strategies
6. **Cost Tracking**: Track LLM usage and costs

