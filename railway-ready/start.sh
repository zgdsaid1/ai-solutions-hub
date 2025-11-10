#!/bin/bash

# AI Solutions Hub Backend - Railway Start Script

echo "🚀 Starting AI Solutions Hub Backend Server..."
echo "📦 Node.js Version: $(node --version)"
echo "📦 NPM Version: $(npm --version)"

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
  echo "📥 Installing dependencies..."
  npm install --production
fi

# Start the server
echo "🌐 Starting Express server on port ${PORT:-8080}..."
exec node index.js