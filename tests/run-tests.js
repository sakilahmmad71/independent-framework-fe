#!/usr/bin/env node

/**
 * Simple test runner for framework-agnostic business logic tests
 * Runs all tests without any framework dependencies
 */

console.log('========================================');
console.log('Framework-Agnostic Business Logic Tests');
console.log('========================================\n');

async function runTests() {
  try {
    // Run all test files
    await import('./Todo.test.js');
    console.log();
    await import('./TodoService.test.js');
    console.log();
    await import('./Store.test.js');
    
    console.log('\n========================================');
    console.log('🎉 All test suites completed successfully!');
    console.log('========================================\n');
    console.log('✨ Note: These tests run with ZERO framework dependencies!');
    console.log('   The same business logic works in React, Vue, or any framework.\n');
  } catch (error) {
    console.error('\n❌ Test execution failed:', error);
    process.exit(1);
  }
}

runTests();
