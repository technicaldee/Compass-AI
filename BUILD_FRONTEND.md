# Building Frontend from Root Directory

The root `Dockerfile` now builds the Next.js frontend application from the `frontend` directory.

## Build Instructions

### Using Docker directly:

```bash
# Build from root directory
docker build -t compass-ai-frontend .

# Run the container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1 \
  compass-ai-frontend
```

### Using Docker Compose:

```bash
# Build and start from root directory
docker-compose up --build

# Or in detached mode
docker-compose up -d --build
```

## How it works

- The Dockerfile uses the root directory as build context (`.`)
- It copies files from the `frontend/` subdirectory
- Files are copied to `/app` in the container
- The Next.js server runs from `/app` directory

## Environment Variables

- `NEXT_PUBLIC_API_URL`: API base URL (default: `http://localhost:3000/api/v1`)
- `NODE_ENV`: Set to `production` in Docker
- `PORT`: Port to run on (default: `3000`)

## Volumes

The `.data` directory from `frontend/.data` is mounted to persist project data.

