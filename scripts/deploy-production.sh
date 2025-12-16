#!/bin/bash

# Production Deployment Script
# This script handles the complete production deployment process

set -e  # Exit on any error

echo "🚀 Starting Production Deployment Process..."
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Pre-deployment validation
print_status "Step 1: Running pre-deployment validation..."
if node scripts/validate-implementation.js; then
    print_success "Validation passed - 100% success rate"
else
    print_error "Validation failed - aborting deployment"
    exit 1
fi

# Step 2: Install dependencies
print_status "Step 2: Installing production dependencies..."
if npm ci --production; then
    print_success "Production dependencies installed"
else
    print_error "Failed to install production dependencies"
    exit 1
fi

# Step 3: Run tests
print_status "Step 3: Running test suite..."
if npm test; then
    print_success "All tests passed"
else
    print_error "Tests failed - aborting deployment"
    exit 1
fi

# Step 4: Build for production
print_status "Step 4: Building for production..."
if npm run build; then
    print_success "Production build completed"
else
    print_error "Build failed - aborting deployment"
    exit 1
fi

# Step 5: Verify build artifacts
print_status "Step 5: Verifying build artifacts..."
if [ -f "dist/game.js" ] && [ -f "dist/styles.css" ] && [ -f "dist/index.html" ]; then
    print_success "Build artifacts verified"
else
    print_error "Missing build artifacts - aborting deployment"
    exit 1
fi

# Step 6: Set production environment
print_status "Step 6: Setting production environment..."
export NODE_ENV=production
export ENABLE_PERFORMANCE_MONITORING=true
export ENABLE_MOBILE_OPTIMIZATION=true
export ENABLE_ACCESSIBILITY_FEATURES=true
export LOG_LEVEL=info
print_success "Production environment configured"

# Step 7: Start production server
print_status "Step 7: Starting production server..."
print_warning "Starting server on port 3000..."
print_warning "Press Ctrl+C to stop the server"

# Start the server
node server.js

print_success "Production deployment completed successfully!"
print_status "Server is running and ready to accept connections"
print_status "Health check: http://localhost:3000/health"
print_status "Performance metrics: http://localhost:3000/performance"