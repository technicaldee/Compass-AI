import { AgentConfig } from '../types/agents';

export const agentConfigs: Record<string, AgentConfig> = {
  templateMatcher: {
    name: 'Template Matcher',
    description: 'Analyzes user input and recommends the best project template',
    temperature: 0.3,
    maxTokens: 500,
  },
  dataCollector: {
    name: 'Data Collector',
    description: 'Guides users through progressive data collection',
    temperature: 0.2,
    maxTokens: 1000,
  },
  validator: {
    name: 'Validator',
    description: 'Validates and suggests improvements to project data',
    temperature: 0.1,
    maxTokens: 800,
  },
  analyzer: {
    name: 'Analyzer',
    description: 'Deep-dives into project data and identifies patterns',
    temperature: 0.4,
    maxTokens: 1500,
  },
  research: {
    name: 'Research Agent',
    description: 'Contextualizes external data and finds connections',
    temperature: 0.5,
    maxTokens: 1200,
  },
  strategist: {
    name: 'Strategist',
    description: 'Generates high-level strategic recommendations',
    temperature: 0.6,
    maxTokens: 2000,
  },
  tactical: {
    name: 'Tactical Agent',
    description: 'Breaks strategies into actionable steps',
    temperature: 0.3,
    maxTokens: 1500,
  },
  risk: {
    name: 'Risk Agent',
    description: 'Identifies potential pitfalls and mitigation strategies',
    temperature: 0.4,
    maxTokens: 1200,
  },
  synthesizer: {
    name: 'Synthesizer',
    description: 'Combines all perspectives into coherent advice',
    temperature: 0.5,
    maxTokens: 2500,
  },
};
