'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle2, Loader2, ArrowLeft, Zap } from 'lucide-react'
import { apiClient, InsightReport } from '@/lib/api'
import toast from 'react-hot-toast'

export default function InsightsPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string
  const [insights, setInsights] = useState<InsightReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  const generateInsights = useCallback(async () => {
    try {
      setGenerating(true)
      const response = await apiClient.generateInsights(projectId)
      if (response.success) {
        setInsights(response.data)
        toast.success('Insights generated successfully!')
      }
    } catch {
      toast.error('Failed to generate insights')
    } finally {
      setGenerating(false)
    }
  }, [projectId])

  const loadInsights = useCallback(async () => {
    try {
      setLoading(true)
      const response = await apiClient.getInsights(projectId)
      if (response.success) {
        setInsights(response.data)
      } else {
        // Try to generate if not found
        await generateInsights()
      }
    } catch {
      // Try to generate if not found
      await generateInsights()
    } finally {
      setLoading(false)
    }
  }, [projectId, generateInsights])

  useEffect(() => {
    loadInsights()
  }, [loadInsights])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-[var(--color-primary)] animate-spin mx-auto mb-4" />
          <p className="text-[var(--color-muted-foreground)]">Loading insights...</p>
        </motion.div>
      </div>
    )
  }

  if (!insights) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <Zap className="w-16 h-16 text-[var(--color-primary)] mx-auto mb-6" />
          <h2 className="text-2xl font-display font-bold mb-4">No Insights Yet</h2>
          <p className="text-[var(--color-muted-foreground)] mb-8">
            Generate AI-powered insights for your project
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generateInsights}
            disabled={generating}
            className="px-6 py-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-[var(--color-background)] font-display font-semibold rounded-lg disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate Insights'}
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-4 mb-4">
            <Sparkles className="w-8 h-8 text-[var(--color-primary)]" />
            <h1 className="text-4xl md:text-5xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">
              Project Insights
            </h1>
          </div>
          <p className="text-[var(--color-muted-foreground)]">{insights.summary.headline}</p>
        </motion.div>

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12 p-8 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-display font-bold mb-2">{insights.summary.headline}</h2>
              <div className="flex items-center gap-4 text-sm text-[var(--color-muted-foreground)]">
                <span>Confidence: {Math.round(insights.summary.confidence * 100)}%</span>
                <span>•</span>
                <span>{insights.metadata.agentsInvolved.length} agents involved</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-display font-bold text-[var(--color-primary)]">
                {Math.round(insights.summary.confidence * 100)}%
              </div>
              <div className="text-xs text-[var(--color-muted-foreground)]">Confidence</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {insights.summary.basedOn.map((item, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-full text-xs text-[var(--color-primary)]"
              >
                {item}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-[var(--color-primary)]" />
            <h2 className="text-3xl font-display font-bold">Recommendations</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {insights.recommendations.map((rec, i) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="p-6 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl hover:border-[var(--color-primary)]/50 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-display font-semibold text-lg">{rec.title}</h3>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      rec.category === 'quick-win'
                        ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]'
                        : rec.category === 'strategic'
                        ? 'bg-[var(--color-secondary)]/20 text-[var(--color-secondary)]'
                        : 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]'
                    }`}
                  >
                    {rec.category}
                  </span>
                </div>
                <p className="text-[var(--color-muted-foreground)] text-sm mb-4">{rec.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--color-muted-foreground)]">Priority: {rec.priority}</span>
                  <span className="text-[var(--color-primary)]">
                    {Math.round(rec.confidence * 100)}% confident
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Risks */}
        {insights.risks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-6 h-6 text-[var(--color-accent)]" />
              <h2 className="text-3xl font-display font-bold">Risks & Mitigations</h2>
            </div>
            <div className="space-y-4">
              {insights.risks.map((risk, i) => (
                <motion.div
                  key={risk.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="p-6 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-display font-semibold">{risk.title}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        risk.severity === 'critical'
                          ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]'
                          : risk.severity === 'high'
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {risk.severity}
                    </span>
                  </div>
                  <p className="text-[var(--color-muted-foreground)] text-sm mb-4">{risk.description}</p>
                  {risk.mitigation.length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-2 text-[var(--color-foreground)]">
                        Mitigation Strategies:
                      </p>
                      <ul className="space-y-1">
                        {risk.mitigation.map((mit, j) => (
                          <li key={j} className="flex items-start gap-2 text-xs text-[var(--color-muted-foreground)]">
                            <CheckCircle2 className="w-3 h-3 mt-0.5 text-[var(--color-primary)] flex-shrink-0" />
                            {mit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Action Plan */}
        {insights.actionPlan.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle2 className="w-6 h-6 text-[var(--color-secondary)]" />
              <h2 className="text-3xl font-display font-bold">Action Plan</h2>
            </div>
            <div className="space-y-3">
              {insights.actionPlan.map((action, i) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.05 }}
                  className="p-4 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg flex items-start gap-4"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center text-sm font-mono font-bold text-[var(--color-primary)] flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-semibold mb-1">{action.title}</h3>
                    <p className="text-sm text-[var(--color-muted-foreground)] mb-2">{action.description}</p>
                    <div className="flex items-center gap-4 text-xs text-[var(--color-muted-foreground)]">
                      <span>Priority: {action.priority}</span>
                      <span>•</span>
                      <span>Est. Time: {action.estimatedTime}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

