@echo off
echo 🚀 Starting Mastra Insight Assistant (Backend + Frontend)
echo.

REM Check if node_modules exist
if not exist "node_modules" (
    echo 📦 Installing backend dependencies...
    call npm install
)

if not exist "frontend\node_modules" (
    echo 📦 Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

echo.
echo ✅ Starting both servers...
echo    Backend:  http://localhost:3000
echo    Frontend: http://localhost:3001
echo.
echo Press Ctrl+C to stop both servers
echo.

call npm run dev:all

