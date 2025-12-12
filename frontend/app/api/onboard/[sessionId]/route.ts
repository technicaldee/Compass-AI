import { NextRequest, NextResponse } from 'next/server'
import { onboardingFlow } from '@/lib/flows/onboarding'

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params
    const body = await request.json()
    const { userInput } = body

    if (!userInput || typeof userInput !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'userInput is required', code: 'VALIDATION_ERROR' },
        },
        { status: 400 }
      )
    }

    const result = await onboardingFlow.continue(sessionId, userInput)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Continue onboard error:', error)
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

