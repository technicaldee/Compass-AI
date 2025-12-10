import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Mastra Insight Assistant',
  description: 'AI-powered project insights and recommendations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--color-card)',
              color: 'var(--color-foreground)',
              border: '1px solid var(--color-border)',
            },
            success: {
              iconTheme: {
                primary: 'var(--color-primary)',
                secondary: 'var(--color-background)',
              },
            },
            error: {
              iconTheme: {
                primary: 'var(--color-accent)',
                secondary: 'var(--color-background)',
              },
            },
          }}
        />
      </body>
    </html>
  )
}

