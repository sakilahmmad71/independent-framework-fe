/**
 * Unit Tests for TodoService
 * These tests run without any framework dependencies
 */
import { TodoService } from '../src/core/services/TodoService.js';
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
console.log('Running TodoService Tests...\n');

// Test 1: Add a todo
try {
  const store = new Store({ todos: [] });
  const service = new TodoService(store);
  
  const todo = service.addTodo('Test task');
  
  assertEquals(store.getState().todos.length, 1, 'Should have 1 todo');
  assertEquals(store.getState().todos[0].title, 'Test task', 'Todo should have correct title');
  assert(todo.id, 'Todo should have an ID');
  console.log('✓ Test 1 passed: Add a todo');
} catch (error) {
  console.error('✗ Test 1 failed:', error.message);
}

// Test 2: Reject empty todo
try {
  const store = new Store({ todos: [] });
  const service = new TodoService(store);
  
  let errorThrown = false;
  try {
    service.addTodo('');
  } catch (e) {
    errorThrown = true;
  }
  
  assert(errorThrown, 'Should throw error for empty todo');
  assertEquals(store.getState().todos.length, 0, 'Should have 0 todos');
  console.log('✓ Test 2 passed: Reject empty todo');
} catch (error) {
  console.error('✗ Test 2 failed:', error.message);
}

// Test 3: Toggle a todo
try {
  const store = new Store({ todos: [] });
  const service = new TodoService(store);
  
  const todo = service.addTodo('Test task');
  service.toggleTodo(todo.id);
  
  assertEquals(store.getState().todos[0].completed, true, 'Todo should be completed');
  
  service.toggleTodo(todo.id);
  assertEquals(store.getState().todos[0].completed, false, 'Todo should be uncompleted');
  console.log('✓ Test 3 passed: Toggle a todo');
} catch (error) {
  console.error('✗ Test 3 failed:', error.message);
}

// Test 4: Delete a todo
try {
  const store = new Store({ todos: [] });
  const service = new TodoService(store);
  
  const todo1 = service.addTodo('Task 1');
  const todo2 = service.addTodo('Task 2');
  
  assertEquals(store.getState().todos.length, 2, 'Should have 2 todos');
  
  service.deleteTodo(todo1.id);
  
  assertEquals(store.getState().todos.length, 1, 'Should have 1 todo');
  assertEquals(store.getState().todos[0].id, todo2.id, 'Should have task 2');
  console.log('✓ Test 4 passed: Delete a todo');
} catch (error) {
  console.error('✗ Test 4 failed:', error.message);
}

// Test 5: Get active todos
try {
  const store = new Store({ todos: [] });
  const service = new TodoService(store);
  
  service.addTodo('Task 1');
  const todo2 = service.addTodo('Task 2');
  service.toggleTodo(todo2.id);
  
  const active = service.getActiveTodos();
  assertEquals(active.length, 1, 'Should have 1 active todo');
  assertEquals(active[0].title, 'Task 1', 'Active todo should be Task 1');
  console.log('✓ Test 5 passed: Get active todos');
} catch (error) {
  console.error('✗ Test 5 failed:', error.message);
}

// Test 6: Get completed todos
try {
  const store = new Store({ todos: [] });
  const service = new TodoService(store);
  
  const todo1 = service.addTodo('Task 1');
  service.addTodo('Task 2');
  service.toggleTodo(todo1.id);
  
  const completed = service.getCompletedTodos();
  assertEquals(completed.length, 1, 'Should have 1 completed todo');
  assertEquals(completed[0].title, 'Task 1', 'Completed todo should be Task 1');
  console.log('✓ Test 6 passed: Get completed todos');
} catch (error) {
  console.error('✗ Test 6 failed:', error.message);
}

// Test 7: Clear completed todos
try {
  const store = new Store({ todos: [] });
  const service = new TodoService(store);
  
  const todo1 = service.addTodo('Task 1');
  service.addTodo('Task 2');
  service.toggleTodo(todo1.id);
  
  service.clearCompleted();
  
  assertEquals(store.getState().todos.length, 1, 'Should have 1 todo');
  assertEquals(store.getState().todos[0].title, 'Task 2', 'Remaining todo should be Task 2');
  console.log('✓ Test 7 passed: Clear completed todos');
} catch (error) {
  console.error('✗ Test 7 failed:', error.message);
}

// Test 8: Get statistics
try {
  const store = new Store({ todos: [] });
  const service = new TodoService(store);
  
  service.addTodo('Task 1');
  const todo2 = service.addTodo('Task 2');
  const todo3 = service.addTodo('Task 3');
  service.toggleTodo(todo2.id);
  service.toggleTodo(todo3.id);
  
  const stats = service.getStats();
  assertEquals(stats.total, 3, 'Should have 3 total todos');
  assertEquals(stats.active, 1, 'Should have 1 active todo');
  assertEquals(stats.completed, 2, 'Should have 2 completed todos');
  console.log('✓ Test 8 passed: Get statistics');
} catch (error) {
  console.error('✗ Test 8 failed:', error.message);
}

// Test 9: Update todo title
try {
  const store = new Store({ todos: [] });
  const service = new TodoService(store);
  
  const todo = service.addTodo('Old title');
  service.updateTodo(todo.id, 'New title');
  
  assertEquals(store.getState().todos[0].title, 'New title', 'Todo title should be updated');
  console.log('✓ Test 9 passed: Update todo title');
} catch (error) {
  console.error('✗ Test 9 failed:', error.message);
}

console.log('\n✅ All TodoService tests completed!');
