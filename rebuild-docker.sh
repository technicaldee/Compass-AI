#!/bin/bash

# Clean rebuild script for frontend Docker image
# This ensures no cached layers interfere with the build

echo "🧹 Cleaning up old Docker images and containers..."
docker stop compass-ai-frontend 2>/dev/null || true
docker rm compass-ai-frontend 2>/dev/null || true
docker rmi compass-ai-frontend 2>/dev/null || true

echo "🗑️  Pruning Docker build cache..."
docker builder prune -f

echo "🔨 Building frontend Docker image (no cache)..."
docker build --no-cache --progress=plain -t compass-ai-frontend .

echo "✅ Build complete!"
echo "🚀 To run: docker run -p 3000:3000 compass-ai-frontend"

