# Simple Next.js Dockerfile for development
FROM node:20-alpine

WORKDIR /app

# Copy package files from frontend
COPY frontend/package.json frontend/package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy all frontend files
COPY frontend/ ./

# Create .data directory for persistence
RUN mkdir -p .data

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=development

# Run Next.js in development mode
CMD ["npm", "run", "dev"]
