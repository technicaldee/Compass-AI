import { NextRequest, NextResponse } from 'next/server'
import { advisoryFlow } from '@/lib/flows/advisory'
import { memory } from '@/lib/memory'

// POST /api/v1/advice/:projectId - Generate insights
export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params
    const body = await request.json().catch(() => ({}))
    const { projectData } = body // Optional: allow client to pass project data

    const insight = await advisoryFlow.generateInsights(projectId, projectData)
    return NextResponse.json({ success: true, data: insight })
  } catch (error: any) {
    console.error('Generate advice error:', error)
    
    // Handle project not found errors - return 404 instead of 500
    if (error?.code === 'PROJECT_NOT_FOUND' || error?.statusCode === 404 || error?.message?.includes('not found')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `Project ${params.projectId} not found. Please ensure the project was created through the onboarding flow.`,
            code: 'PROJECT_NOT_FOUND',
          },
        },
        { status: 404 }
      )
    }
    
    // Handle rate limit errors specifically
    if (error?.isRateLimit || error?.status === 429) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: error.message || 'Rate limit exceeded. Please try again later.',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: error.retryAfter || '60',
          },
        },
        { status: 429 }
      )
    }
    
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: error?.status || error?.statusCode || 500 }
    )
  }
}

// GET /api/v1/advice/:projectId - Retrieve existing insights
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params
    const insight = memory.getInsight(projectId)

    if (!insight) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `Insight for project ${projectId} not found`,
            code: 'NOT_FOUND',
          },
        },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: insight })
  } catch (error) {
    console.error('Get advice error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    )
  }
}

