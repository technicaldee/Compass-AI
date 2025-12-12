# Multi-stage build for Next.js frontend
# This Dockerfile builds the frontend application from the frontend directory

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files from frontend directory
COPY frontend/package.json frontend/package-lock.json* ./

# Install dependencies
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy package files from frontend directory
COPY frontend/package.json frontend/package-lock.json* ./

# Copy Next.js config files from frontend directory
COPY frontend/next.config.js ./
COPY frontend/tsconfig.json ./
COPY frontend/tailwind.config.ts ./
COPY frontend/postcss.config.js ./

# Copy source code directories from frontend
COPY frontend/app ./app
COPY frontend/components ./components
COPY frontend/lib ./lib

# Copy any other necessary files from frontend
COPY frontend/next-env.d.ts ./

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the Next.js application
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js

# Create public directory (Next.js static assets are in .next/static)
RUN mkdir -p ./public

# Create .data directory for persistence
RUN mkdir -p .data && chown -R nextjs:nodejs .data

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check for Next.js app
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["npm", "start"]
