'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Sparkles, CheckCircle2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'
import { AnimatedBackground } from '@/components/AnimatedBackground'

export default function OnboardPage() {
  const router = useRouter()
  const [step, setStep] = useState<'input' | 'collecting' | 'complete'>('input')
  const [userInput, setUserInput] = useState('')
  const [category, setCategory] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [projectId, setProjectId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<string[]>([])

  const categories = [
    { value: 'tech', label: 'Technology', emoji: '💻' },
    { value: 'business', label: 'Business', emoji: '💼' },
    { value: 'community', label: 'Community', emoji: '🌍' },
    { value: 'education', label: 'Education', emoji: '📚' },
    { value: 'healthcare', label: 'Healthcare', emoji: '🏥' },
    { value: 'finance', label: 'Finance', emoji: '💰' },
  ]

  const handleStart = async () => {
    if (!userInput.trim()) {
      toast.error('Please describe your project')
      return
    }

    setStep('collecting')
    try {
      const response = await apiClient.onboard(userInput, category || undefined)
      if (response.success) {
        setSessionId(response.data.sessionId)
        setCurrentQuestion(response.data.nextQuestion || 'Tell me more about your project goals')
        setStep('input')
      }
    } catch {
      toast.error('Failed to start onboarding')
      setStep('input')
    }
  }

  const handleContinue = async () => {
    if (!userInput.trim() || !sessionId) return

    setStep('collecting')
    const currentAnswer = userInput
    setAnswers([...answers, currentAnswer])
    setUserInput('')

    try {
      const response = await apiClient.continueOnboard(sessionId, currentAnswer)
      if (response.success) {
        if (response.data.isComplete && response.data.projectId) {
          setProjectId(response.data.projectId)
          setStep('complete')
          toast.success('Project created successfully!')
        } else {
          setCurrentQuestion(response.data.nextQuestion || 'Tell me more')
          setStep('input')
        }
      }
    } catch {
      toast.error('Failed to continue onboarding')
      setStep('input')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative">
      <AnimatedBackground />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-block mb-4"
          >
            <Sparkles className="w-12 h-12 text-[var(--color-primary)] animate-glow" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">
            Let&apos;s Get Started
          </h1>
          <p className="text-[var(--color-muted-foreground)]">
            Tell us about your project and we&apos;ll help you create a comprehensive plan
          </p>
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {step === 'input' && !sessionId && (
            <motion.div
              key="initial"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium mb-3 text-[var(--color-foreground)]">
                  Category (Optional)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {categories.map((cat) => (
                    <motion.button
                      key={cat.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCategory(cat.value)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        category === cat.value
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                          : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
                      }`}
                    >
                      <div className="text-2xl mb-1">{cat.emoji}</div>
                      <div className="text-xs font-medium">{cat.label}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Project Description */}
              <div>
                <label className="block text-sm font-medium mb-3 text-[var(--color-foreground)]">
                  Describe Your Project
                </label>
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="I want to build a tech startup focused on AI-powered project management..."
                  className="w-full px-4 py-3 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] resize-none text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)]"
                  rows={6}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStart}
                className="w-full px-6 py-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-[var(--color-background)] font-display font-semibold rounded-lg flex items-center justify-center gap-2"
              >
                Start Onboarding
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}

          {step === 'input' && sessionId && (
            <motion.div
              key="collecting"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Progress Indicator */}
              <div className="flex items-center gap-2 mb-6">
                {answers.map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="w-2 h-2 rounded-full bg-[var(--color-primary)]"
                  />
                ))}
                <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]/30" />
              </div>

              {/* Question */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg"
              >
                <p className="text-[var(--color-foreground)] font-medium mb-4">{currentQuestion}</p>
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Your answer..."
                  className="w-full px-4 py-3 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] resize-none text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)]"
                  rows={4}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      handleContinue()
                    }
                  }}
                />
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleContinue}
                disabled={!userInput.trim()}
                className="w-full px-6 py-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-[var(--color-background)] font-display font-semibold rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}

          {step === 'collecting' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <Loader2 className="w-12 h-12 text-[var(--color-primary)] animate-spin mb-4" />
              <p className="text-[var(--color-muted-foreground)]">Processing your response...</p>
            </motion.div>
          )}

          {step === 'complete' && projectId && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <CheckCircle2 className="w-20 h-20 text-[var(--color-primary)] mx-auto mb-6" />
              </motion.div>
              <h2 className="text-3xl font-display font-bold mb-4">Project Created!</h2>
              <p className="text-[var(--color-muted-foreground)] mb-8">
                Your project has been set up. Let&apos;s generate some insights.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(`/insights/${projectId}`)}
                className="px-8 py-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-[var(--color-background)] font-display font-semibold rounded-lg flex items-center gap-2 mx-auto"
              >
                Generate Insights
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

