# Tools Guide

## Overview

Tools provide external data integration capabilities. They fetch, process, and cache data from various sources.

## Tool Interface

All tools implement the `DataTool` interface:

```typescript
interface DataTool {
  name: string;
  description: string;
  relevanceScore: (project: ProjectPayload) => number;
  fetch: (context: ProjectContext) => Promise<EnrichedData>;
  cache: CacheStrategy;
}
```

## Available Tools

### GitHub Tool

**Purpose**: Fetch trending GitHub repositories

**Relevance Scoring**:
- Tech projects: 0.9
- Business projects: 0.6
- Other: 0.3

**Data Fetched**:
- Repository name, stars, language
- Description, URL
- Trend score

**Caching**:
- TTL: 1 hour
- Key: Based on project category

**Configuration**:
- API Key: `GITHUB_API_KEY`
- Rate Limit: 60 requests/minute
- Retry: 3 attempts with backoff

**Example**:
```typescript
const data = await githubTool.fetch({
  project: { category: 'tech', ... },
  sessionId: 'session-123'
});
```

### News Tool

**Purpose**: Fetch relevant news articles

**Relevance Scoring**:
- Business/Finance/Tech: 0.8
- Other: 0.5

**Data Fetched**:
- Article title, description
- URL, publish date
- Source, relevance score

**Caching**:
- TTL: 30 minutes
- Key: Based on query (category + goals)

**Configuration**:
- API Key: `NEWS_API_KEY`
- Rate Limit: 100 requests/day
- Retry: 2 attempts

**Query Building**:
- Combines category and goal keywords
- Limits to 100 characters

**Example**:
```typescript
const data = await newsTool.fetch({
  project: { 
    category: 'business',
    goals: [{ description: 'Launch product' }]
  },
  sessionId: 'session-123'
});
```

### Weather Tool

**Purpose**: Fetch weather data for event planning

**Relevance Scoring**:
- Community projects: 0.9
- Projects mentioning events/outdoor: 0.8
- Other: 0.3

**Data Fetched**:
- Location, temperature
- Condition, forecast
- Recommendations

**Caching**:
- TTL: 30 minutes
- Key: Based on location

**Configuration**:
- API Key: `WEATHER_API_KEY`
- Rate Limit: 60 requests/minute
- Retry: 3 attempts

**Location Extraction**:
- Searches project text for location keywords
- Falls back to default location

**Example**:
```typescript
const data = await weatherTool.fetch({
  project: { 
    category: 'community',
    goals: [{ description: 'Outdoor event in New York' }]
  },
  sessionId: 'session-123'
});
```

## Tool Selection

Tools are automatically selected based on relevance:

```typescript
const relevantTools = selectRelevantTools(project);
// Returns tools with relevance > 0.3, sorted by score
```

## Caching Strategy

### Cache Key Generation

Each tool defines how cache keys are generated:

```typescript
cache: {
  key: (context) => `tool-name:${context.project.category}`
}
```

### Cache TTL

- **GitHub**: 1 hour (trends change slowly)
- **News**: 30 minutes (news is time-sensitive)
- **Weather**: 30 minutes (weather changes frequently)

### Cache Invalidation

- Automatic expiration based on TTL
- Manual invalidation via cache manager
- Cache statistics available via metrics

## Error Handling

### Retry Logic

Each tool has retry configuration:

```typescript
retry: {
  maxAttempts: 3,
  backoffMs: 1000
}
```

### Fallback Data

When APIs fail, tools return mock/fallback data:

- **GitHub**: Returns sample repositories
- **News**: Returns sample articles
- **Weather**: Returns default weather data

### Error Logging

All errors are logged with context:
- Tool name
- Error message
- Request parameters
- Timestamp

## Rate Limiting

Tools respect rate limits:

- **GitHub**: 60 req/min
- **News**: 100 req/day
- **Weather**: 60 req/min

Rate limit info included in tool config.

## Adding New Tools

To add a new tool:

1. Create tool file in `src/tools/data-sources/`
2. Implement `DataTool` interface
3. Add relevance scoring logic
4. Configure caching strategy
5. Add to `allDataTools` array
6. Add configuration to `toolConfigs`
7. Add API key to environment variables

Example:
```typescript
export const myTool: DataTool = {
  name: 'my-tool',
  description: 'My custom tool',
  
  relevanceScore: (project) => {
    // Calculate relevance 0-1
    return 0.8;
  },
  
  fetch: async (context) => {
    // Fetch data
    return {
      source: 'my-tool',
      data: {...},
      relevanceScore: 0.8,
      timestamp: new Date(),
      metadata: {}
    };
  },
  
  cache: {
    ttl: 3600,
    key: (context) => `my-tool:${context.project.category}`,
    enabled: true
  }
};
```

## Tool Composition

Tools can be used together:

```typescript
// Fetch from multiple tools in parallel
const [githubData, newsData, weatherData] = await Promise.all([
  githubTool.fetch(context),
  newsTool.fetch(context),
  weatherTool.fetch(context)
]);

// Combine results
const combinedData = {
  github: githubData,
  news: newsData,
  weather: weatherData
};
```

## Performance Considerations

1. **Parallel Fetching**: Fetch from multiple tools simultaneously
2. **Caching**: Aggressive caching reduces API calls
3. **Lazy Loading**: Only fetch when tool is relevant
4. **Batch Requests**: Combine similar requests when possible

## Monitoring

Tool usage is tracked via metrics:

- `tool.{name}.fetch.duration`: Fetch time
- `tool.{name}.fetch.success`: Success count
- `tool.{name}.fetch.error`: Error count
- `tool.{name}.cache.hit`: Cache hit count
- `tool.{name}.cache.miss`: Cache miss count

## Best Practices

1. **Always Cache**: Cache expensive API calls
2. **Handle Errors**: Provide fallback data
3. **Rate Limit**: Respect API rate limits
4. **Log Everything**: Log for debugging
5. **Test Fallbacks**: Test error scenarios
6. **Monitor Usage**: Track API usage and costs

