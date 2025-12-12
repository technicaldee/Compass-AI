import { ProjectTemplate, ProjectCategory } from './types'

export const templates: ProjectTemplate[] = [
  {
    id: 'tech',
    name: 'Tech Project',
    category: [ProjectCategory.TECH],
    description: 'For technology projects, software development, and tech startups',
    fields: {
      projectName: '',
      category: 'tech',
      goals: [],
      owner: '',
    },
  },
  {
    id: 'community',
    name: 'Community Project',
    category: [ProjectCategory.COMMUNITY],
    description: 'For community events, gatherings, and social initiatives',
    fields: {
      projectName: '',
      category: 'community',
      goals: [],
      owner: '',
    },
  },
  {
    id: 'creative',
    name: 'Creative Project',
    category: [ProjectCategory.CREATIVE],
    description: 'For creative projects, arts, design, and content creation',
    fields: {
      projectName: '',
      category: 'creative',
      goals: [],
      owner: '',
    },
  },
]

export function getTemplateById(id: string): ProjectTemplate | undefined {
  return templates.find((t) => t.id === id)
}

export function getTemplatesByCategory(category: ProjectCategory): ProjectTemplate[] {
  return templates.filter((t) => t.category.includes(category))
}

