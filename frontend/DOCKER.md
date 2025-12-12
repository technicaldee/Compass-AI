# Docker Setup for Frontend

This directory contains Docker configuration files to build and run the Next.js frontend application.

## Quick Start

### Build and Run with Docker

```bash
# Build the Docker image
docker build -t compass-ai-frontend .

# Run the container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1 \
  compass-ai-frontend
```

### Using Docker Compose

```bash
# Build and start the service
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the service
docker-compose down
```

## Environment Variables

- `NEXT_PUBLIC_API_URL`: API base URL (default: `http://localhost:3000/api/v1`)
- `NODE_ENV`: Node environment (set to `production` in Docker)
- `PORT`: Port to run on (default: `3000`)

## Volumes

The `.data` directory is mounted as a volume to persist project data across container restarts.

## Building

The Dockerfile uses a multi-stage build:
1. **deps**: Installs all dependencies
2. **builder**: Builds the Next.js application
3. **runner**: Creates the final production image with only necessary files

## Production Considerations

- The image uses Node.js 20 Alpine for a smaller footprint
- Runs as a non-root user for security
- Includes health checks for container orchestration
- Persists data in `.data` directory

