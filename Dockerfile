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

# Verify standalone output was created
RUN test -f .next/standalone/server.js || (echo "ERROR: Next.js standalone output not found!" && exit 1)

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
# Next.js standalone output includes everything needed
# The standalone folder contains server.js and node_modules
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Verify server.js exists
RUN test -f server.js || (echo "ERROR: server.js not found in standalone output!" && ls -la && exit 1)

# Create public directory (Next.js will handle static assets)
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

# Start the application using Next.js standalone server
CMD ["node", "server.js"]
