#!/bin/bash
# Quick start script for development

# Terminal 1: Start the backend
echo "Starting backend server on port 3000..."
cd backend
npm run dev &
BACKEND_PID=$!

# Give backend time to start
sleep 3

# Terminal 2: Start the frontend
echo "Starting frontend dev server on port 5173..."
cd ../frontend
npm run dev

# Cleanup on exit
trap "kill $BACKEND_PID" EXIT
