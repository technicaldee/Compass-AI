#!/bin/bash

echo "🚀 Installing Mastra Insight Assistant Frontend dependencies..."

cd frontend

if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the frontend directory."
    exit 1
fi

echo "📦 Installing npm packages..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Create .env.local file with NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1"
    echo "2. Run 'npm run dev' to start the development server"
    echo "3. Open http://localhost:3001 in your browser"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

