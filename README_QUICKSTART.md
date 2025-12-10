# Quick Start Guide

## Running Both Frontend and Backend Together

### Option 1: Using npm script (Recommended)

First, install dependencies:

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

Then run both servers:

```bash
npm run dev:all
```

This will start:
- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:3001

### Option 2: Using the dev script

**Windows:**
```bash
.\scripts\dev.bat
```

**Mac/Linux:**
```bash
chmod +x scripts/dev.sh
./scripts/dev.sh
```

### Option 3: Manual (separate terminals)

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Available Scripts

### Development
- `npm run dev` - Start backend only
- `npm run dev:frontend` - Start frontend only
- `npm run dev:all` - Start both backend and frontend together ⭐

### Production
- `npm run build` - Build backend
- `npm run build:frontend` - Build frontend
- `npm run build:all` - Build both
- `npm run start:all` - Start both in production mode

### Other
- `npm run install:all` - Install all dependencies (backend + frontend)
- `npm run lint:all` - Lint both projects

## Environment Setup

### Backend
Create `.env` file in root:
```env
PORT=3000
NODE_ENV=development
MASTRA_API_KEY=your_key_here
```

### Frontend
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

## Troubleshooting

### Port Already in Use
- Backend uses port 3000
- Frontend uses port 3001
- If ports are in use, stop other services or change ports in config

### Dependencies Not Installed
Run `npm run install:all` to install all dependencies

### Concurrently Not Found
Run `npm install` in the root directory to install concurrently

## Stopping Servers

Press `Ctrl+C` in the terminal to stop both servers when using `dev:all`

