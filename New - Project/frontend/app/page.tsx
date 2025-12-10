'use client'

import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, Zap, Target, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { AnimatedBackground } from '@/components/AnimatedBackground'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative">
      <AnimatedBackground />
      {/* Hero Section */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex-1 flex items-center justify-center px-4 py-20"
      >
        <div className="max-w-6xl w-full mx-auto text-center">
          {/* Animated Title */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-6xl md:text-8xl font-display font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-accent)]">
              Mastra Insight
            </h1>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
              className="inline-block"
            >
              <Sparkles className="w-12 h-12 text-[var(--color-primary)] animate-glow" />
            </motion.div>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl md:text-2xl text-[var(--color-muted-foreground)] mb-12 max-w-2xl mx-auto"
          >
            AI-powered project insights that transform your ideas into actionable strategies
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Link href="/onboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-8 py-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-[var(--color-background)] font-display font-semibold text-lg rounded-lg overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get Started
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-accent)]"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </Link>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-24 grid md:grid-cols-3 gap-6"
          >
            {[
              {
                icon: Zap,
                title: 'Multi-Agent Intelligence',
                description: '8 specialized AI agents work together to provide comprehensive insights',
                color: 'var(--color-primary)',
              },
              {
                icon: Target,
                title: 'Smart Data Integration',
                description: 'Automatically fetches relevant data from GitHub, News, and Weather APIs',
                color: 'var(--color-secondary)',
              },
              {
                icon: TrendingUp,
                title: 'Actionable Recommendations',
                description: 'Get strategic recommendations with clear reasoning and confidence scores',
                color: 'var(--color-accent)',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9 + index * 0.1, duration: 0.6 }}
                className="group relative p-6 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl hover:border-[var(--color-primary)] transition-all duration-300"
              >
                <div
                  className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                  style={{ background: `linear-gradient(135deg, ${feature.color}15 0%, transparent 100%)` }}
                />
                <feature.icon
                  className="w-10 h-10 mb-4"
                  style={{ color: feature.color }}
                />
                <h3 className="font-display font-semibold text-xl mb-2">{feature.title}</h3>
                <p className="text-[var(--color-muted-foreground)] text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="border-t border-[var(--color-border)] py-8 px-4"
      >
        <div className="max-w-6xl mx-auto text-center text-[var(--color-muted-foreground)] text-sm">
          Built with ❤️ using Mastra
        </div>
      </motion.footer>
    </div>
  )
}

