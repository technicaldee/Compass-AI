# 🚀 Quick Start - Run Both Frontend & Backend

## Easiest Way (Recommended)

### Windows PowerShell:
```powershell
.\scripts\start-dev.ps1
```

### Mac/Linux:
```bash
node scripts/start-dev.js
```

### Or use npm script:
```bash
npm run dev:all
```

## What This Does

- ✅ Starts backend on http://localhost:3000
- ✅ Starts frontend on http://localhost:3001
- ✅ Shows colored output for each server
- ✅ Handles Ctrl+C to stop both servers

## Alternative Methods

### Method 1: Using npm script (if concurrently is installed)
```bash
npm run dev:all:concurrent
```

### Method 2: Manual (two terminals)

**Terminal 1:**
```bash
npm run dev
```

**Terminal 2:**
```bash
cd frontend
npm run dev
```

### Method 3: Using the batch script (Windows)
```bash
.\scripts\dev.bat
```

## First Time Setup

If dependencies aren't installed:

```bash
# Install all dependencies
npm run install:all
```

Or manually:
```bash
# Backend
npm install

# Frontend
cd frontend
npm install
cd ..
```

## Troubleshooting

### Port Already in Use
- Backend: Change `PORT` in `.env` file
- Frontend: Change port in `frontend/package.json` scripts

### Script Not Found
- Make sure you're in the project root directory
- On Windows, you may need to enable script execution:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

### Dependencies Missing
Run `npm run install:all` to install all dependencies

## Stopping Servers

Press `Ctrl+C` once to stop both servers when using `dev:all`

---

**That's it!** Both servers will start and you can access:
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000/api/v1

