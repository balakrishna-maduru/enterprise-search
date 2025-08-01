#!/bin/bash
# Kill any existing React processes
pkill -f "react-scripts start" || true
pkill -f "node.*react-scripts" || true

# Clear cache
rm -rf node_modules/.cache
rm -rf .eslintcache

# Start the development server
GENERATE_SOURCEMAP=false npm start
