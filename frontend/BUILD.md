# Building the Frontend Docker Image

## Option 1: Build from frontend directory (Recommended)

```bash
cd frontend
docker build -t compass-ai-frontend .
docker run -p 3000:3000 compass-ai-frontend
```

## Option 2: Build from root directory with explicit Dockerfile path

```bash
# From the root directory
docker build -f frontend/Dockerfile -t compass-ai-frontend ./frontend
docker run -p 3000:3000 compass-ai-frontend
```

## Option 3: Use Docker Compose (Easiest)

```bash
cd frontend
docker-compose up --build
```

## Troubleshooting

If you get errors about missing files:
1. Make sure you're in the `frontend` directory OR using `-f frontend/Dockerfile`
2. Clear Docker cache: `docker build --no-cache -t compass-ai-frontend .`
3. Check that you have all required files in the frontend directory

## Note

The root `Dockerfile` is for the backend (expects `src/` directory).
The `frontend/Dockerfile` is for the Next.js frontend (expects `app/`, `components/`, `lib/` directories).

