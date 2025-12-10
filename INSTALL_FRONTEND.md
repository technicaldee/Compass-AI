# Frontend Installation Guide

## Quick Start

### Option 1: Using the install script (Recommended)

**Windows:**
```bash
cd frontend
.\scripts\install.bat
```

**Mac/Linux:**
```bash
cd frontend
chmod +x scripts/install.sh
./scripts/install.sh
```

### Option 2: Manual Installation

```bash
cd frontend
npm install
```

## Environment Setup

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

## Running the Frontend

### Development Mode

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:3001`

### Production Build

```bash
cd frontend
npm run build
npm start
```

## Prerequisites

- Node.js 18+ installed
- Backend API running on port 3000 (or update `NEXT_PUBLIC_API_URL`)

## Troubleshooting

### Port Already in Use

If port 3001 is already in use, Next.js will automatically use the next available port.

### API Connection Issues

Make sure:
1. Backend is running on the correct port
2. `NEXT_PUBLIC_API_URL` in `.env.local` matches your backend URL
3. CORS is properly configured on the backend

### Build Errors

Try:
```bash
rm -rf node_modules .next
npm install
npm run build
```

## Features

- ✨ Beautiful, distinctive design
- 🎨 Dark theme with vibrant accents
- 📱 Fully responsive
- 🚀 Optimized performance
- 🎯 Smooth animations

