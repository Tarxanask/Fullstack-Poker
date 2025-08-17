// Simple test to verify the application is working
console.log('🧪 Running Simple Application Test');

// Test 1: Check if the application is accessible
async function testApplicationAccess() {
  try {
    const response = await fetch('http://localhost:3000');
    if (response.ok) {
      console.log('✅ Frontend application is accessible');
      return true;
    } else {
      console.log('❌ Frontend application returned status:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Frontend application is not accessible:', error.message);
    return false;
  }
}

// Test 2: Check if the backend API is accessible
async function testBackendAPI() {
  try {
    const response = await fetch('http://localhost:8000/');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend API is accessible:', data.message);
      return true;
    } else {
      console.log('❌ Backend API returned status:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Backend API is not accessible:', error.message);
    return false;
  }
}

// Test 3: Check if the database is working
async function testDatabaseConnection() {
  try {
    const response = await fetch('http://localhost:8000/api/hands');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Database connection is working');
      return true;
    } else {
      console.log('❌ Database connection failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Database connection error:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting application tests...\n');
  
  const frontendTest = await testApplicationAccess();
  const backendTest = await testBackendAPI();
  const databaseTest = await testDatabaseConnection();
  
  console.log('\n📊 Test Results:');
  console.log('Frontend:', frontendTest ? '✅ PASS' : '❌ FAIL');
  console.log('Backend:', backendTest ? '✅ PASS' : '❌ FAIL');
  console.log('Database:', databaseTest ? '✅ PASS' : '❌ FAIL');
  
  const allPassed = frontendTest && backendTest && databaseTest;
  console.log('\n🎯 Overall Result:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
  
  if (allPassed) {
    console.log('\n🎉 Your poker application is working correctly!');
    console.log('🌐 Access it at: http://localhost:3000');
    console.log('📚 API docs at: http://localhost:8000/docs');
  } else {
    console.log('\n⚠️  Some components need attention. Check the logs above.');
  }
}

// Run the tests
runAllTests();
