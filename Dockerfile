# Simple Next.js Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files from frontend
COPY frontend/package.json frontend/package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy all frontend files
COPY frontend/ ./

# Build the Next.js app
RUN npm run build

# Create .data directory for persistence
RUN mkdir -p .data

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

# Start the Next.js app
CMD ["npm", "start"]
