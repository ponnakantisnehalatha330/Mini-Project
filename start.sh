#!/bin/bash
echo "🇮🇳 Starting AI Government Scheme Hub..."
echo ""

# Start backend
echo "🚀 Starting Backend (port 5000)..."
cd backend && npm install --silent && node server.js &
BACKEND_PID=$!

# Wait for backend
sleep 2

# Start frontend
echo "⚛️  Starting Frontend (port 3000)..."
cd ../frontend && npm install --silent && npm start &

echo ""
echo "✅ Both servers starting..."
echo "   Backend:  http://localhost:5000"
echo "   Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
wait
