import { GoogleGenerativeAI } from '@google/generative-ai'

function getGenAI() {
    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_AI
    if (!API_KEY) {
        throw new Error('NEXT_PUBLIC_GOOGLE_AI environment variable is not set')
    }
    return new GoogleGenerativeAI(API_KEY)
}

export interface AgentConfig {
    temperature?: number
    maxTokens?: number
    model?: string
}

export async function callAI(
    prompt: string,
    config: AgentConfig = {}
): Promise<string> {
    const defaultModel = process.env.NEXT_PUBLIC_GOOGLE_AI_MODEL || 'gemini-2.5-flash-lite'
    const {
        temperature = 0.7,
        maxTokens = 2000,
        model = defaultModel,
    } = config

    try {
        const genAI = getGenAI()
        const modelInstance = genAI.getGenerativeModel({
            model,
            generationConfig: {
                temperature,
                maxOutputTokens: maxTokens,
            },
        })

        const result = await modelInstance.generateContent(prompt)
        const response = await result.response
        return response.text()
    } catch (error: any) {
        console.error('AI API Error:', error)
        
        // Check for rate limit errors
        if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota') || error?.message?.includes('rate limit')) {
            const retryAfter = error?.errorDetails?.find((d: any) => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo')?.retryDelay || '60'
            const rateLimitError: any = new Error(`Rate limit exceeded. Please retry after ${retryAfter} seconds.`)
            rateLimitError.status = 429
            rateLimitError.retryAfter = retryAfter
            rateLimitError.isRateLimit = true
            throw rateLimitError
        }
        
        throw new Error(`AI API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

export async function callAIStructured<T>(
    prompt: string,
    schema: string,
    config: AgentConfig = {}
): Promise<T> {
    const structuredPrompt = `${prompt}

Please respond with a valid JSON object matching this schema:
${schema}

Return ONLY valid JSON, no markdown formatting, no code blocks.`

    const response = await callAI(structuredPrompt, {
        ...config,
        temperature: config.temperature ?? 0.3, // Lower temperature for structured output
    })

    try {
        // Remove markdown code blocks if present
        const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        return JSON.parse(cleaned) as T
    } catch (error) {
        console.error('Failed to parse AI response as JSON:', response)
        throw new Error(`Failed to parse structured response: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

