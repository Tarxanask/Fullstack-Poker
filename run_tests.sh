#!/bin/bash

echo "🧪 Running Poker Game Tests"
echo "=========================="

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start the application if not running
echo "🚀 Starting application..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Test 1: Backend API Tests
echo ""
echo "🔧 Running Backend API Tests..."
if docker-compose exec backend python -m pytest test_api.py -v; then
    echo "✅ Backend API tests passed"
else
    echo "❌ Backend API tests failed"
    exit 1
fi

# Test 2: Frontend Component Tests
echo ""
echo "🎨 Running Frontend Component Tests..."
if docker-compose exec frontend npm test -- --passWithNoTests; then
    echo "✅ Frontend component tests passed"
else
    echo "❌ Frontend component tests failed"
    exit 1
fi

# Test 3: E2E Tests (if Cypress is available)
echo ""
echo "🌐 Running E2E Tests..."
if command_exists cypress; then
    if docker-compose exec frontend npx cypress run; then
        echo "✅ E2E tests passed"
    else
        echo "❌ E2E tests failed"
        exit 1
    fi
else
    echo "⚠️  Cypress not found, skipping E2E tests"
    echo "   To run E2E tests, install Cypress: npm install -g cypress"
fi

echo ""
echo "🎉 All tests completed successfully!"
echo ""
echo "📊 Test Summary:"
echo "   ✅ Backend API Tests"
echo "   ✅ Frontend Component Tests"
if command_exists cypress; then
    echo "   ✅ E2E Tests"
else
    echo "   ⚠️  E2E Tests (skipped)"
fi

echo ""
echo "🌐 Application is running at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
