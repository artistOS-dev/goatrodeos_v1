#!/bin/bash

# GoatRodeos Setup Script

echo "🎵 GoatRodeos Setup"
echo "==================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18+ first."
    exit 1
fi

echo "✓ Node.js version: $(node --version)"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

echo "✓ PostgreSQL is installed"

# Create database if it doesn't exist
echo "Creating database..."
createdb goatrodeos 2>/dev/null || echo "Database already exists"

# Install dependencies
echo ""
echo "Installing dependencies..."
npm run install-all

# Setup database schema
echo ""
echo "Setting up database schema..."
cd server
npm run db:setup

# Optional: seed sample data
read -p "Would you like to add sample data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run db:seed
fi

cd ..

echo ""
echo "✓ Setup complete!"
echo ""
echo "📝 Important: Create a .env file in the server directory with:"
echo "   DATABASE_URL=postgresql://user:password@localhost:5432/goatrodeos"
echo ""
echo "🚀 To start development:"
echo "   Terminal 1: cd server && npm run dev"
echo "   Terminal 2: cd client && npm run dev"
echo ""
echo "Visit http://localhost:3000 to get started!"
