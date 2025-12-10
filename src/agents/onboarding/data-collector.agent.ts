import { AgentResponse } from '../../types/agents';
import { Goal, Owner, Priority } from '../../types/schemas';
import { agentConfigs } from '../../config/agents.config';
import { logger } from '../../utils/logger';
import { metrics } from '../../utils/metrics';
import { conversationMemory } from '../../memory/conversation-memory';

interface CollectionState {
  projectName?: string;
  category?: string;
  goals: Goal[];
  owner?: Owner;
  constraints?: string[];
  timeline?: {
    startDate?: Date;
    endDate?: Date;
  };
}

export const dataCollectorAgent = {
  name: agentConfigs.dataCollector.name,
  config: agentConfigs.dataCollector,

  /**
   * Guides users through progressive data collection
   */
  async collectData(
    sessionId: string,
    userInput: string,
    currentState?: CollectionState
  ): Promise<
    AgentResponse<{ state: CollectionState; nextQuestion?: string; isComplete: boolean }>
  > {
    const startTime = Date.now();

    try {
      logger.info('Data collection started', { sessionId, userInput });

      const state: CollectionState = currentState || { goals: [] };

      // Extract information from user input
      this.extractInformation(userInput, state);

      // Determine next question
      const nextQuestion = this.determineNextQuestion(state);
      const isComplete = !nextQuestion;

      // Store conversation
      conversationMemory.addMessage(sessionId, {
        role: 'user',
        content: userInput,
        timestamp: new Date(),
      });

      if (nextQuestion) {
        conversationMemory.addMessage(sessionId, {
          role: 'assistant',
          content: nextQuestion,
          timestamp: new Date(),
        });
      }

      metrics.timing('agent.data_collector.duration', Date.now() - startTime);
      metrics.increment('agent.data_collector.success');

      return {
        success: true,
        data: {
          state,
          nextQuestion,
          isComplete,
        },
        confidence: isComplete ? 0.9 : 0.6,
        reasoning: isComplete
          ? 'All required data collected'
          : `Need more information: ${nextQuestion}`,
      };
    } catch (error) {
      metrics.increment('agent.data_collector.error');
      logger.error('Data collection failed', { error });
      return {
        success: false,
        data: {
          state: currentState || { goals: [] },
          isComplete: false,
        },
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  extractInformation(input: string, state: CollectionState): void {
    const inputLower = input.toLowerCase();

    // Extract project name
    if (!state.projectName && input.length > 5) {
      // Simple heuristic: first substantial phrase
      const phrases = input.split(/[.!?]/);
      if (phrases[0] && phrases[0].length > 5) {
        state.projectName = phrases[0].trim();
      }
    }

    // Extract category keywords
    const categoryKeywords: Record<string, string> = {
      tech: 'tech',
      technology: 'tech',
      software: 'tech',
      business: 'business',
      community: 'community',
      education: 'education',
      healthcare: 'healthcare',
      finance: 'finance',
    };

    if (!state.category) {
      for (const [keyword, category] of Object.entries(categoryKeywords)) {
        if (inputLower.includes(keyword)) {
          state.category = category;
          break;
        }
      }
    }

    // Extract goals (simple pattern matching)
    if (
      inputLower.includes('goal') ||
      inputLower.includes('want to') ||
      inputLower.includes('aim to')
    ) {
      const goalText = input.split(/[.!?]/)[0];
      if (goalText && goalText.length > 10) {
        state.goals.push({
          id: `goal-${Date.now()}`,
          description: goalText.trim(),
          priority: Priority.MEDIUM,
          measurable: false,
        });
      }
    }
  },

  determineNextQuestion(state: CollectionState): string | undefined {
    if (!state.projectName) {
      return "What's the name of your project?";
    }

    if (!state.category) {
      return 'What category does this project fall into? (tech, business, community, education, etc.)';
    }

    if (state.goals.length === 0) {
      return 'What are your main goals for this project?';
    }

    if (!state.owner) {
      return 'Who is the project owner? Please provide a name.';
    }

    // All required fields collected
    return undefined;
  },
};
