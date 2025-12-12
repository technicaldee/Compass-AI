import { NextRequest, NextResponse } from 'next/server'
import { onboardingFlow } from '@/lib/flows/onboarding'
import { ProjectCategory } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userInput, category } = body

    if (!userInput || typeof userInput !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'userInput is required', code: 'VALIDATION_ERROR' },
        },
        { status: 400 }
      )
    }

    const result = await onboardingFlow.start(userInput, category as ProjectCategory | undefined)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Onboard error:', error)
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

