# PowerShell script to start both backend and frontend
Write-Host "🚀 Starting Mastra Insight Assistant (Backend + Frontend)" -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exist
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
    npm install
}

if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
}

Write-Host ""
Write-Host "✅ Starting both servers..." -ForegroundColor Green
Write-Host "   Backend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3001" -ForegroundColor Magenta
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Yellow
Write-Host ""

# Start backend in background job
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npm run dev
}

# Start frontend in background job
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location frontend
    npm run dev
}

# Wait for both jobs
try {
    Write-Host "Backend and Frontend are starting..." -ForegroundColor Green
    Write-Host "Check the output above for server URLs" -ForegroundColor Yellow
    Write-Host ""
    
    # Show job output
    Receive-Job -Job $backendJob, $frontendJob -Wait
} finally {
    # Cleanup jobs
    Stop-Job -Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
    Remove-Job -Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
}

