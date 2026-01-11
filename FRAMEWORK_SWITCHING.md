# Switching Frameworks Guide

This guide demonstrates how to switch between different UI frameworks without changing business logic.

## The Business Logic (Framework Independent)

```typescript
// src/core/usecases/TodoUseCase.ts
// This code NEVER changes regardless of framework
export class TodoUseCase {
  constructor(private repository: TodoRepository) {}
  
  async createTodo(input: CreateTodoInput): Promise<Todo> {
    if (!input.title.trim()) {
      throw new Error('Todo title cannot be empty');
    }
    // ... business logic
  }
}
```

## Framework Integrations

### Switching from React to Vue

#### Before (React)

```typescript
// examples/react/useTodoUseCase.ts
import { useState, useEffect } from 'react';
import { TodoUseCase } from '../../src/core/usecases/TodoUseCase';
import { InMemoryTodoRepository } from '../../src/adapters/InMemoryTodoRepository';

export function useTodoUseCase() {
  const [todoUseCase] = useState(() => new TodoUseCase(new InMemoryTodoRepository()));
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    const unsubscribe = todoUseCase.subscribeTodos(setTodos);
    todoUseCase.loadTodos();
    return unsubscribe;
  }, [todoUseCase]);

  return {
    todos,
    createTodo: (title, desc) => todoUseCase.createTodo({ title, description: desc }),
    toggleTodo: (id) => todoUseCase.toggleTodo(id),
    deleteTodo: (id) => todoUseCase.deleteTodo(id),
  };
}
```

#### After (Vue)

```typescript
// examples/vue/composables/useTodoUseCase.ts
import { ref, onMounted, onUnmounted } from 'vue';
import { TodoUseCase } from '../../src/core/usecases/TodoUseCase';
import { InMemoryTodoRepository } from '../../src/adapters/InMemoryTodoRepository';

export function useTodoUseCase() {
  const todoUseCase = new TodoUseCase(new InMemoryTodoRepository());
  const todos = ref([]);

  let unsubscribe;
  
  onMounted(() => {
    unsubscribe = todoUseCase.subscribeTodos((newTodos) => {
      todos.value = newTodos;
    });
    todoUseCase.loadTodos();
  });

  onUnmounted(() => {
    if (unsubscribe) unsubscribe();
  });

  return {
    todos,
    createTodo: (title, desc) => todoUseCase.createTodo({ title, description: desc }),
    toggleTodo: (id) => todoUseCase.toggleTodo(id),
    deleteTodo: (id) => todoUseCase.deleteTodo(id),
  };
}
```

### Switching from Vue to Svelte

#### Before (Vue)

```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { TodoUseCase } from '../../src/core/usecases/TodoUseCase';
import { InMemoryTodoRepository } from '../../src/adapters/InMemoryTodoRepository';

const todoUseCase = new TodoUseCase(new InMemoryTodoRepository());
const todos = ref([]);

let unsubscribe;

onMounted(() => {
  unsubscribe = todoUseCase.subscribeTodos((newTodos) => {
    todos.value = newTodos;
  });
  todoUseCase.loadTodos();
});

onUnmounted(() => unsubscribe?.());

const createTodo = async (title, description) => {
  await todoUseCase.createTodo({ title, description });
};
</script>

<template>
  <div v-for="todo in todos" :key="todo.id">
    {{ todo.title }}
  </div>
</template>
```

#### After (Svelte)

```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { writable } from 'svelte/store';
  import { TodoUseCase } from '../../src/core/usecases/TodoUseCase';
  import { InMemoryTodoRepository } from '../../src/adapters/InMemoryTodoRepository';

  const todoUseCase = new TodoUseCase(new InMemoryTodoRepository());
  const todos = writable([]);

  let unsubscribe;

  onMount(() => {
    unsubscribe = todoUseCase.subscribeTodos(todos.set);
    todoUseCase.loadTodos();
  });

  onDestroy(() => unsubscribe?.());

  async function createTodo(title, description) {
    await todoUseCase.createTodo({ title, description });
  }
</script>

{#each $todos as todo (todo.id)}
  <div>{todo.title}</div>
{/each}
```

### Switching from Framework to Vanilla JS

#### Before (Any Framework)

Framework-specific hooks/composables as shown above.

#### After (Vanilla JavaScript)

```javascript
// examples/vanilla/app.js
import { TodoUseCase } from '../../src/core/usecases/TodoUseCase';
import { InMemoryTodoRepository } from '../../src/adapters/InMemoryTodoRepository';

class TodoApp {
  constructor() {
    this.todoUseCase = new TodoUseCase(new InMemoryTodoRepository());
    
    // Subscribe to changes
    this.todoUseCase.subscribeTodos((todos) => {
      this.render(todos);
    });
    
    this.todoUseCase.loadTodos();
  }

  render(todos) {
    const container = document.getElementById('app');
    container.innerHTML = todos
      .map(todo => `<div>${todo.title}</div>`)
      .join('');
  }

  async createTodo(title, description) {
    await this.todoUseCase.createTodo({ title, description });
  }
}

new TodoApp();
```

## What Changes? What Stays the Same?

### ✅ **What NEVER Changes** (Business Logic Layer)

- Entity definitions (`Todo`, `User`)
- Business rules in use cases
- Repository interfaces (ports)
- Tests for business logic
- Core business logic algorithms

### 🔄 **What Changes** (Framework Integration Layer)

- State management syntax (useState vs ref vs writable)
- Lifecycle hooks (useEffect vs onMounted vs onMount)
- Template syntax (JSX vs Vue templates vs Svelte markup)
- Component structure

## Key Benefits

### 1. **Minimal Migration Effort**

When switching frameworks, you only rewrite ~10-20% of your code (the UI layer), not the entire application.

### 2. **Consistent Behavior**

Business rules are enforced identically across all frameworks:
- Same validation errors
- Same state management behavior
- Same data flow

### 3. **Reusable Tests**

Your test suite for business logic works with any framework:

```typescript
// This test works regardless of UI framework
describe('TodoUseCase', () => {
  it('should reject empty title', async () => {
    const useCase = new TodoUseCase(new InMemoryTodoRepository());
    await expect(useCase.createTodo({ title: '', description: 'Test' }))
      .rejects.toThrow('Todo title cannot be empty');
  });
});
```

### 4. **Gradual Migration**

You can migrate page by page or feature by feature:
- Keep React for one page
- Use Vue for another page
- Both use the same business logic layer

## Switching Adapters (Data Source)

Not only can you switch UI frameworks, but you can also switch data sources:

```typescript
// Development: Use in-memory storage
const todoUseCase = new TodoUseCase(new InMemoryTodoRepository());

// Browser: Use localStorage
const todoUseCase = new TodoUseCase(new LocalStorageTodoRepository());

// Production: Use REST API (create RestApiTodoRepository)
const todoUseCase = new TodoUseCase(new RestApiTodoRepository('https://api.example.com'));
```

The use case and UI code remain identical!

## Example Migration Timeline

### Week 1: Preparation
- Extract business logic to use cases
- Create repository interfaces
- Write tests for business logic

### Week 2: Create New Framework Version
- Set up new framework project
- Create framework bindings (hooks/composables)
- Connect to existing business logic

### Week 3: Parallel Running
- Run both frameworks side-by-side
- Verify identical behavior
- Test edge cases

### Week 4: Switch
- Deploy new framework version
- Monitor for issues
- Remove old framework code

## Summary

With this architecture:
- **Business logic**: Write once, use everywhere
- **UI layer**: Swap freely between frameworks
- **Data layer**: Switch storage mechanisms easily
- **Tests**: Remain valid across all frameworks
- **Migration**: Fast and low-risk

The key is keeping the core business logic framework-independent!
