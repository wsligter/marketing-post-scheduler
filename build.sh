#!/bin/bash

# Exit on error
set -e

echo "Installing dependencies..."
npm install

echo "Installing backend dependencies..."
cd backend
npm install
cd ..

echo "Installing frontend dependencies..."
cd frontend
npm install

echo "Building frontend..."
npm run build
cd ..

echo "Build completed successfully!"
