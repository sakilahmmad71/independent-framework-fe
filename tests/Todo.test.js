/**
 * Unit Tests for Todo Model
 * These tests run without any framework dependencies
 */
import { Todo } from '../src/core/models/Todo.js';

// Simple test runner
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
console.log('Running Todo Model Tests...\n');

// Test 1: Create a todo
try {
  const todo = new Todo(1, 'Test task');
  assertEquals(todo.id, 1, 'Todo ID should be 1');
  assertEquals(todo.title, 'Test task', 'Todo title should be "Test task"');
  assertEquals(todo.completed, false, 'Todo should not be completed by default');
  console.log('✓ Test 1 passed: Create a todo');
} catch (error) {
  console.error('✗ Test 1 failed:', error.message);
}

// Test 2: Toggle a todo
try {
  const todo = new Todo(1, 'Test task', false);
  const toggled = todo.toggle();
  assertEquals(toggled.completed, true, 'Toggled todo should be completed');
  assertEquals(todo.completed, false, 'Original todo should remain unchanged (immutability)');
  console.log('✓ Test 2 passed: Toggle a todo');
} catch (error) {
  console.error('✗ Test 2 failed:', error.message);
}

// Test 3: Update todo title
try {
  const todo = new Todo(1, 'Old title');
  const updated = todo.updateTitle('New title');
  assertEquals(updated.title, 'New title', 'Updated todo should have new title');
  assertEquals(todo.title, 'Old title', 'Original todo should remain unchanged (immutability)');
  console.log('✓ Test 3 passed: Update todo title');
} catch (error) {
  console.error('✗ Test 3 failed:', error.message);
}

// Test 4: Validate empty title
try {
  const todo = new Todo(1, 'Test');
  let errorThrown = false;
  try {
    todo.updateTitle('');
  } catch (e) {
    errorThrown = true;
  }
  assert(errorThrown, 'Should throw error for empty title');
  console.log('✓ Test 4 passed: Validate empty title');
} catch (error) {
  console.error('✗ Test 4 failed:', error.message);
}

// Test 5: Todo validation
try {
  const validTodo = new Todo(1, 'Valid task');
  assert(validTodo.isValid(), 'Valid todo should pass validation');
  console.log('✓ Test 5 passed: Todo validation');
} catch (error) {
  console.error('✗ Test 5 failed:', error.message);
}

// Test 6: Serialize to JSON
try {
  const todo = new Todo(1, 'Test task', true, new Date('2024-01-01'));
  const json = todo.toJSON();
  assertEquals(json.id, 1, 'JSON should have correct id');
  assertEquals(json.title, 'Test task', 'JSON should have correct title');
  assertEquals(json.completed, true, 'JSON should have correct completed status');
  console.log('✓ Test 6 passed: Serialize to JSON');
} catch (error) {
  console.error('✗ Test 6 failed:', error.message);
}

// Test 7: Deserialize from JSON
try {
  const json = {
    id: 1,
    title: 'Test task',
    completed: true,
    createdAt: '2024-01-01T00:00:00.000Z'
  };
  const todo = Todo.fromJSON(json);
  assertEquals(todo.id, 1, 'Deserialized todo should have correct id');
  assertEquals(todo.title, 'Test task', 'Deserialized todo should have correct title');
  assertEquals(todo.completed, true, 'Deserialized todo should have correct completed status');
  console.log('✓ Test 7 passed: Deserialize from JSON');
} catch (error) {
  console.error('✗ Test 7 failed:', error.message);
}

console.log('\n✅ All Todo Model tests completed!');
