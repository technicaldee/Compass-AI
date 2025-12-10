@echo off
echo 🚀 Installing Mastra Insight Assistant Frontend dependencies...

cd frontend

if not exist "package.json" (
    echo ❌ Error: package.json not found. Make sure you're in the frontend directory.
    exit /b 1
)

echo 📦 Installing npm packages...
call npm install

if %errorlevel% equ 0 (
    echo ✅ Dependencies installed successfully!
    echo.
    echo Next steps:
    echo 1. Create .env.local file with NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
    echo 2. Run 'npm run dev' to start the development server
    echo 3. Open http://localhost:3001 in your browser
) else (
    echo ❌ Failed to install dependencies
    exit /b 1
)

