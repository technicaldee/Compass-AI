import { AgentResponse, TemplateMatchResult } from '../../types/agents';
import { ProjectCategory } from '../../types/schemas';
import { agentConfigs } from '../../config/agents.config';
import { logger } from '../../utils/logger';
import { metrics } from '../../utils/metrics';

interface Template {
  id: string;
  name: string;
  category: ProjectCategory[];
  description: string;
  requiredFields: string[];
}

const templates: Template[] = [
  {
    id: 'tech-startup',
    name: 'Tech Startup',
    category: [ProjectCategory.TECH, ProjectCategory.BUSINESS],
    description: 'For technology startups and software projects',
    requiredFields: ['projectName', 'goals', 'owner', 'timeline'],
  },
  {
    id: 'community-event',
    name: 'Community Event',
    category: [ProjectCategory.COMMUNITY],
    description: 'For organizing community events and gatherings',
    requiredFields: ['projectName', 'goals', 'owner', 'timeline', 'constraints'],
  },
  {
    id: 'business-strategy',
    name: 'Business Strategy',
    category: [ProjectCategory.BUSINESS, ProjectCategory.FINANCE],
    description: 'For business planning and strategic initiatives',
    requiredFields: ['projectName', 'goals', 'owner', 'constraints'],
  },
  {
    id: 'educational-program',
    name: 'Educational Program',
    category: [ProjectCategory.EDUCATION],
    description: 'For educational programs and learning initiatives',
    requiredFields: ['projectName', 'goals', 'owner', 'timeline'],
  },
];

export const templateMatcherAgent = {
  name: agentConfigs.templateMatcher.name,
  config: agentConfigs.templateMatcher,

  /**
   * Analyzes user input and recommends the best project template
   */
  async matchTemplate(
    userInput: string,
    category?: ProjectCategory
  ): Promise<AgentResponse<TemplateMatchResult>> {
    const startTime = Date.now();

    try {
      logger.info('Template matching started', { userInput, category });

      // Score each template based on category and input keywords
      const scoredTemplates = templates.map((template) => {
        let score = 0;

        // Category match
        if (category && template.category.includes(category)) {
          score += 0.5;
        }

        // Keyword matching
        const inputLower = userInput.toLowerCase();
        const templateKeywords = [
          ...template.category.map((c) => c.toLowerCase()),
          ...template.name.toLowerCase().split(' '),
          ...template.description.toLowerCase().split(' '),
        ];

        const keywordMatches = templateKeywords.filter((keyword) =>
          inputLower.includes(keyword)
        ).length;
        score += (keywordMatches / templateKeywords.length) * 0.5;

        return {
          template,
          score,
        };
      });

      // Sort by score and get the best match
      scoredTemplates.sort((a, b) => b.score - a.score);
      const bestMatch = scoredTemplates[0];

      if (!bestMatch || bestMatch.score < 0.3) {
        // Default to generic template
        const defaultTemplate = templates.find((t) => t.id === 'tech-startup') || templates[0];
        return {
          success: true,
          data: {
            templateId: defaultTemplate.id,
            confidence: 0.5,
            reasoning: 'No strong match found, using default template',
            suggestedFields: defaultTemplate.requiredFields,
          },
          confidence: 0.5,
        };
      }

      const result: TemplateMatchResult = {
        templateId: bestMatch.template.id,
        confidence: Math.min(bestMatch.score, 1),
        reasoning: `Matched "${bestMatch.template.name}" based on category and keyword analysis`,
        suggestedFields: bestMatch.template.requiredFields,
      };

      metrics.timing('agent.template_matcher.duration', Date.now() - startTime);
      metrics.increment('agent.template_matcher.success');

      logger.info('Template matched successfully', { result });

      return {
        success: true,
        data: result,
        confidence: result.confidence,
        reasoning: result.reasoning,
      };
    } catch (error) {
      metrics.increment('agent.template_matcher.error');
      logger.error('Template matching failed', { error });
      return {
        success: false,
        data: {
          templateId: 'tech-startup',
          confidence: 0,
          reasoning: 'Error occurred during template matching',
          suggestedFields: [],
        },
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
};
