# Flow Orchestration

## Overview

Flows coordinate multiple agents to accomplish complex tasks. They manage state, handle errors, and enable parallel execution.

## Flow Architecture

```
Flow
  ├── State Management
  ├── Agent Orchestration
  ├── Error Handling
  └── Result Aggregation
```

## Onboarding Flow

### Purpose

Guide users through project setup with template matching and progressive data collection.

### Stages

1. **Template Matching**
   - Agent: Template Matcher
   - Input: User description, optional category
   - Output: Template ID, confidence, suggested fields

2. **Data Collection**
   - Agent: Data Collector
   - Input: User responses, current state
   - Output: Updated state, next question
   - Pattern: Multi-turn conversation

3. **Validation**
   - Agent: Validator
   - Input: Collected project data
   - Output: Validation result, errors, suggestions
   - Checkpoint: Only proceeds if valid

4. **Completion**
   - Save project to memory
   - Return project ID

### State Management

- **Session-based**: Each onboarding session has unique ID
- **Incremental**: Data collected progressively
- **Persistent**: Saved to project memory on completion

### Error Handling

- Template matching failure → Use default template
- Data collection failure → Return error, allow retry
- Validation failure → Return errors, allow correction

### Example

```typescript
// Start onboarding
const { sessionId, templateId } = await onboardingFlow.start(
  "I want to build a tech startup",
  "tech"
);

// Continue collecting data
const result = await onboardingFlow.continue(sessionId, "Launch MVP in 3 months");

// When complete, get projectId
if (result.isComplete) {
  const projectId = result.projectId;
}
```

## Advisory Flow

### Purpose

Generate comprehensive insights using multi-agent system.

### Stages

1. **Parallel Analysis** (Stage 1)
   - Analyzer Agent: Deep project analysis
   - External Data Tools: Fetch relevant data
   - Pattern: Parallel execution for speed

2. **Strategy Generation** (Stage 2)
   - Agent: Strategist
   - Input: Analysis results
   - Output: High-level strategies

3. **Tactical Breakdown** (Stage 3)
   - Agent: Tactical
   - Input: Strategy results
   - Output: Actionable steps

4. **Risk Assessment** (Stage 4)
   - Agent: Risk
   - Input: Analysis results
   - Output: Risks and mitigations

5. **Synthesis** (Stage 5)
   - Agent: Synthesizer
   - Input: All previous outputs
   - Output: Complete insight report

### Execution Pattern

```
Stage 1: Parallel
  ├── Analyzer Agent ──┐
  └── Data Tools ──────┼──> Stage 2: Strategist
                       │
Stage 2: Sequential ────┼──> Stage 3: Tactical
                       │
Stage 3: Sequential ───┼──> Stage 4: Risk
                       │
Stage 4: Sequential ───┼──> Stage 5: Synthesizer
                       │
Stage 5: Final ────────┘
```

### State Management

- **Project-based**: Tied to project ID
- **Cached**: Results cached for performance
- **Versioned**: Can regenerate with updates

### Error Handling

- Agent failure → Continue with available data
- External API failure → Use fallback data
- Synthesis failure → Return partial results

### Example

```typescript
// Generate insights
const insight = await advisoryFlow.generateInsights(projectId);

// Insight contains:
// - Summary with confidence
// - Recommendations with reasoning
// - Risks with mitigations
// - Action plan with estimates
// - Metadata with reasoning path
```

## Refinement Flow

### Purpose

Update insights based on new project data or feedback.

### Stages

1. **Update Project**
   - Merge updates with existing project
   - Save updated project

2. **Regenerate Insights**
   - Reuse Advisory Flow
   - Generate new insights

3. **Compare** (Future)
   - Compare old vs new insights
   - Highlight changes

### State Management

- **Update-based**: Merges updates with existing
- **Regenerative**: Creates new insights
- **Historical**: Could track insight versions

### Error Handling

- Project not found → Error
- Update validation failure → Return errors
- Regeneration failure → Return previous insights

### Example

```typescript
// Refine with updates
const updatedInsight = await refinementFlow.refine(projectId, {
  goals: [...updatedGoals]
});

// Get reasoning path
const reasoning = await refinementFlow.getReasoningPath(projectId);
```

## Flow Patterns

### Sequential Pattern

Agents execute one after another, each using previous output.

```typescript
const result1 = await agent1.process(input);
const result2 = await agent2.process(result1);
const result3 = await agent3.process(result2);
```

### Parallel Pattern

Agents execute simultaneously, results combined later.

```typescript
const [result1, result2] = await Promise.all([
  agent1.process(input),
  agent2.process(input)
]);
const result3 = await agent3.combine(result1, result2);
```

### Pipeline Pattern

Agents form a pipeline, data flows through.

```typescript
const pipeline = [
  agent1.process,
  agent2.process,
  agent3.process
];
const result = pipeline.reduce(async (acc, fn) => fn(await acc), input);
```

### Checkpoint Pattern

Save state at key points, allow resume.

```typescript
// Save checkpoint
await saveCheckpoint(state);

// Resume from checkpoint
const state = await loadCheckpoint(checkpointId);
const result = await continueFlow(state);
```

## Error Recovery

### Retry Strategy

- **Immediate Retry**: For transient errors
- **Exponential Backoff**: For rate limits
- **Fallback**: Use default/cached data

### Graceful Degradation

- **Partial Results**: Return what's available
- **Default Values**: Use sensible defaults
- **Error Messages**: Clear, actionable errors

## Performance Optimization

1. **Parallel Execution**: Run independent agents in parallel
2. **Caching**: Cache expensive operations
3. **Lazy Loading**: Load data only when needed
4. **Early Exit**: Stop if critical step fails

## Extending Flows

To create a new flow:

1. Create flow file in `src/flows/`
2. Define flow stages
3. Implement error handling
4. Add to flow exports
5. Create API endpoint
6. Add tests

Example:
```typescript
export const myFlow = {
  name: 'my-flow',
  description: 'My custom flow',
  
  async execute(input: Input): Promise<Output> {
    // Flow logic here
  }
};
```

