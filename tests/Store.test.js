/**
 * Unit Tests for Store
 * These tests run without any framework dependencies
 */
import { Store } from '../src/core/store/Store.js';

// Simple test utilities
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEquals(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

// Test Suite
console.log('Running Store Tests...\n');

// Test 1: Initialize with state
try {
  const store = new Store({ count: 0, todos: [] });
  const state = store.getState();
  
  assertEquals(state.count, 0, 'Count should be 0');
  assert(Array.isArray(state.todos), 'Todos should be an array');
  console.log('✓ Test 1 passed: Initialize with state');
} catch (error) {
  console.error('✗ Test 1 failed:', error.message);
}

// Test 2: Update state
try {
  const store = new Store({ count: 0 });
  store.setState({ count: 5 });
  
  assertEquals(store.getState().count, 5, 'Count should be updated to 5');
  console.log('✓ Test 2 passed: Update state');
} catch (error) {
  console.error('✗ Test 2 failed:', error.message);
}

// Test 3: Merge state
try {
  const store = new Store({ count: 0, name: 'test' });
  store.setState({ count: 10 });
  
  const state = store.getState();
  assertEquals(state.count, 10, 'Count should be updated');
  assertEquals(state.name, 'test', 'Name should remain unchanged');
  console.log('✓ Test 3 passed: Merge state');
} catch (error) {
  console.error('✗ Test 3 failed:', error.message);
}

// Test 4: Subscribe to changes
try {
  const store = new Store({ count: 0 });
  let notified = false;
  let newState = null;
  
  const unsubscribe = store.subscribe((state) => {
    notified = true;
    newState = state;
  });
  
  store.setState({ count: 5 });
  
  assert(notified, 'Subscriber should be notified');
  assertEquals(newState.count, 5, 'Subscriber should receive new state');
  
  unsubscribe();
  console.log('✓ Test 4 passed: Subscribe to changes');
} catch (error) {
  console.error('✗ Test 4 failed:', error.message);
}

// Test 5: Unsubscribe
try {
  const store = new Store({ count: 0 });
  let callCount = 0;
  
  const unsubscribe = store.subscribe(() => {
    callCount++;
  });
  
  store.setState({ count: 1 });
  assertEquals(callCount, 1, 'Subscriber should be called once');
  
  unsubscribe();
  
  store.setState({ count: 2 });
  assertEquals(callCount, 1, 'Subscriber should not be called after unsubscribe');
  console.log('✓ Test 5 passed: Unsubscribe');
} catch (error) {
  console.error('✗ Test 5 failed:', error.message);
}

// Test 6: Multiple subscribers
try {
  const store = new Store({ count: 0 });
  let calls1 = 0;
  let calls2 = 0;
  
  store.subscribe(() => calls1++);
  store.subscribe(() => calls2++);
  
  store.setState({ count: 1 });
  
  assertEquals(calls1, 1, 'First subscriber should be called');
  assertEquals(calls2, 1, 'Second subscriber should be called');
  console.log('✓ Test 6 passed: Multiple subscribers');
} catch (error) {
  console.error('✗ Test 6 failed:', error.message);
}

// Test 7: Reset store
try {
  const store = new Store({ count: 0, todos: [] });
  store.setState({ count: 10 });
  
  let notified = false;
  store.subscribe(() => notified = true);
  
  store.reset({ count: 0, todos: [] });
  
  assertEquals(store.getState().count, 0, 'Count should be reset to 0');
  assert(notified, 'Subscribers should be notified of reset');
  console.log('✓ Test 7 passed: Reset store');
} catch (error) {
  console.error('✗ Test 7 failed:', error.message);
}

console.log('\n✅ All Store tests completed!');
