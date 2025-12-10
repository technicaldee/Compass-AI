# Agent Capabilities

## Overview

The system uses 8 specialized agents, each with a clear responsibility and reasoning strategy.

## Onboarding Agents

### Template Matcher Agent

**Purpose**: Analyzes user input and recommends the best project template

**Input**: User description, optional category

**Output**: Template ID, confidence score, reasoning, suggested fields

**Reasoning Strategy**:
- Keyword matching against template descriptions
- Category alignment scoring
- Confidence based on match strength

**Example**:
```typescript
Input: "I want to build a tech startup"
Output: {
  templateId: "tech-startup",
  confidence: 0.9,
  reasoning: "Matched 'Tech Startup' based on category and keyword analysis"
}
```

### Data Collector Agent

**Purpose**: Guides users through progressive data collection

**Input**: User input, current state

**Output**: Updated state, next question, completion status

**Reasoning Strategy**:
- Extracts information from natural language
- Determines what's missing
- Asks contextual follow-up questions
- Maintains conversation context

**Example**:
```typescript
Input: "My project is called AI Assistant"
Output: {
  state: { projectName: "AI Assistant" },
  nextQuestion: "What category does this project fall into?",
  isComplete: false
}
```

### Validator Agent

**Purpose**: Validates project data completeness and quality

**Input**: Partial or complete project data

**Output**: Validation result, errors, suggestions, confidence

**Reasoning Strategy**:
- Checks required fields
- Validates field formats
- Assesses data quality
- Provides improvement suggestions

**Example**:
```typescript
Input: { projectName: "AI", goals: [] }
Output: {
  isValid: false,
  errors: [
    { field: "projectName", message: "Must be at least 3 characters" },
    { field: "goals", message: "At least one goal required" }
  ],
  suggestions: ["Consider making goals measurable"],
  confidence: 0.3
}
```

## Advisory Agents

### Analyzer Agent

**Purpose**: Deep-dives into project data and identifies patterns

**Input**: Complete project data

**Output**: Patterns, strengths, weaknesses, opportunities, threats, confidence

**Reasoning Strategy**:
- SWOT-style analysis
- Pattern recognition
- Completeness assessment
- Category-specific insights

**Example**:
```typescript
Input: { projectName: "Tech Startup", goals: [...], category: "tech" }
Output: {
  patterns: ["Multiple well-defined goals suggest comprehensive planning"],
  strengths: ["Clear and multiple goals provide direction"],
  weaknesses: ["Lack of measurable goals makes progress tracking difficult"],
  opportunities: ["Leverage modern development tools"],
  threats: ["Technical complexity may lead to delays"],
  confidence: 0.85
}
```

### Strategist Agent

**Purpose**: Generates high-level strategic recommendations

**Input**: Project data, analysis results

**Output**: Strategies, priorities, timeline suggestions, resources

**Reasoning Strategy**:
- Leverages analysis insights
- Generates category-specific strategies
- Prioritizes based on goals
- Suggests resource needs

**Example**:
```typescript
Input: Project + Analysis
Output: {
  strategies: [
    "Build on identified strengths: Clear and multiple goals",
    "Adopt agile development methodology"
  ],
  priorities: ["Focus on high-priority goals: 2 identified"],
  timeline: "Sprint-based approach with weekly milestones",
  resources: ["Development team and technical expertise"],
  confidence: 0.8
}
```

### Tactical Agent

**Purpose**: Breaks strategies into actionable steps

**Input**: Project data, strategy results

**Output**: Actions, sequence, dependencies, time estimates

**Reasoning Strategy**:
- Decomposes strategies into tasks
- Determines logical sequence
- Identifies dependencies
- Estimates time requirements

**Example**:
```typescript
Input: Project + Strategy
Output: {
  actions: [
    "Define project scope and objectives",
    "Set up project management tools",
    "Work on goal 1: Launch MVP"
  ],
  sequence: ["Setup actions first", "Then execution"],
  dependencies: ["Define scope must be completed before goal work"],
  estimates: { "Define scope": "1-2 days" },
  confidence: 0.75
}
```

### Risk Agent

**Purpose**: Identifies potential pitfalls and mitigation strategies

**Input**: Project data, analysis results

**Output**: Risks, mitigations, severity assessments

**Reasoning Strategy**:
- Converts threats to risks
- Assesses risk severity
- Generates mitigation strategies
- Categorizes by impact

**Example**:
```typescript
Input: Project + Analysis
Output: {
  risks: [
    "Unclear timeline may lead to scope creep",
    "Technical complexity may lead to delays"
  ],
  mitigations: {
    "Unclear timeline...": [
      "Establish clear milestones",
      "Build buffer time into schedule"
    ]
  },
  severity: {
    "Unclear timeline...": "high"
  },
  confidence: 0.8
}
```

### Synthesizer Agent

**Purpose**: Combines all perspectives into coherent advice

**Input**: All agent outputs, external data

**Output**: Complete insight report with recommendations, risks, action plan

**Reasoning Strategy**:
- Integrates all agent outputs
- Creates structured recommendations
- Formats risks and mitigations
- Builds action plan
- Generates summary

**Example**:
```typescript
Input: Analysis + Strategy + Tactical + Risks + External Data
Output: {
  summary: {
    headline: "Strategic insights for My Project",
    confidence: 0.85,
    basedOn: ["3 patterns identified", "5 strategies recommended"]
  },
  recommendations: [...],
  risks: [...],
  actionPlan: [...],
  metadata: {
    agentsInvolved: ["analyzer", "strategist", "tactical", "risk", "synthesizer"],
    dataSourcesUsed: ["github", "news"],
    processingTime: 2345,
    reasoningPath: [...]
  }
}
```

## Agent Composition

Agents can call other agents:

- **Synthesizer** calls Analyzer, Strategist, Tactical, Risk
- **Advisory Flow** orchestrates Analyzer, Strategist, Tactical, Risk, Synthesizer
- **Onboarding Flow** orchestrates Template Matcher, Data Collector, Validator

## Confidence Scoring

Each agent provides a confidence score (0-1) based on:
- Input data completeness
- Pattern match strength
- Data quality
- External data availability

## Error Handling

Agents handle errors gracefully:
- Return structured error responses
- Provide fallback values
- Log errors for debugging
- Continue processing when possible

## Extending Agents

To add a new agent:

1. Create agent file in `src/agents/`
2. Implement agent interface
3. Add configuration in `src/config/agents.config.ts`
4. Integrate into appropriate flow
5. Add tests

Example:
```typescript
export const myAgent = {
  name: 'My Agent',
  config: agentConfigs.myAgent,
  
  async process(input: Input): Promise<AgentResponse<Output>> {
    // Agent logic here
  }
};
```

