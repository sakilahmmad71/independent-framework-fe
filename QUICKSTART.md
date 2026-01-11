# Quick Start Guide

Get started with framework-independent architecture in 5 minutes!

## What You'll Learn

How to build an app where business logic is completely separate from the UI framework, allowing you to switch between React, Vue, or any other framework without changing business logic.

## Step 1: Understand the Structure

```
src/
├── core/              # ← Your business logic (framework-agnostic)
├── adapters/          # ← Framework bridges (React, Vue, etc.)
└── examples/          # ← Example apps
```

**Key principle:** All business logic lives in `src/core/` and has ZERO framework dependencies.

## Step 2: Create Your Business Logic

### Define a Model (src/core/models/Todo.js)

```javascript
export class Todo {
  constructor(id, title, completed = false) {
    this.id = id;
    this.title = title;
    this.completed = completed;
  }

  toggle() {
    return new Todo(this.id, this.title, !this.completed);
  }
}
```

### Create a Store (src/core/store/Store.js)

```javascript
export class Store {
  constructor(initialState = {}) {
    this.state = initialState;
    this.listeners = new Set();
  }

  getState() {
    return this.state;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach(listener => listener(this.state));
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
```

### Build a Service (src/core/services/TodoService.js)

```javascript
export class TodoService {
  constructor(store) {
    this.store = store;
  }

  addTodo(title) {
    const id = Date.now();
    const todo = new Todo(id, title);
    const todos = [...this.store.getState().todos, todo];
    this.store.setState({ todos });
  }

  toggleTodo(id) {
    const todos = this.store.getState().todos.map(todo =>
      todo.id === id ? todo.toggle() : todo
    );
    this.store.setState({ todos });
  }
}
```

**✅ Done! Your business logic is complete and framework-agnostic.**

## Step 3: Use with React

### Create React Adapter (src/adapters/react/useStore.js)

```javascript
import { useState, useEffect } from 'react';

export function useStore(store) {
  const [state, setState] = useState(store.getState());

  useEffect(() => {
    return store.subscribe((newState) => setState(newState));
  }, [store]);

  return state;
}
```

### Build React Component

```jsx
import { useStore } from './adapters/react';

function TodoApp({ store, todoService }) {
  const state = useStore(store);

  return (
    <div>
      <button onClick={() => todoService.addTodo('New task')}>
        Add Todo
      </button>
      {state.todos.map(todo => (
        <div key={todo.id}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => todoService.toggleTodo(todo.id)}
          />
          {todo.title}
        </div>
      ))}
    </div>
  );
}
```

### Initialize React App

```jsx
import { Store, TodoService } from './core';

const store = new Store({ todos: [] });
const todoService = new TodoService(store);

<TodoApp store={store} todoService={todoService} />
```

## Step 4: Use with Vue

### Create Vue Adapter (src/adapters/vue/useStore.js)

```javascript
import { ref, onMounted, onUnmounted } from 'vue';

export function useStore(store) {
  const state = ref(store.getState());
  let unsubscribe;

  onMounted(() => {
    unsubscribe = store.subscribe((newState) => {
      state.value = newState;
    });
  });

  onUnmounted(() => {
    if (unsubscribe) unsubscribe();
  });

  return state;
}
```

### Build Vue Component

```vue
<template>
  <div>
    <button @click="todoService.addTodo('New task')">
      Add Todo
    </button>
    <div v-for="todo in state.todos" :key="todo.id">
      <input
        type="checkbox"
        :checked="todo.completed"
        @change="todoService.toggleTodo(todo.id)"
      />
      {{ todo.title }}
    </div>
  </div>
</template>

<script setup>
import { useStore } from './adapters/vue';

const props = defineProps(['store', 'todoService']);
const state = useStore(props.store);
</script>
```

### Initialize Vue App

```javascript
import { createApp } from 'vue';
import { Store, TodoService } from './core';

const store = new Store({ todos: [] });
const todoService = new TodoService(store);

createApp(TodoApp, { store, todoService }).mount('#app');
```

## Step 5: Run Tests

Test your business logic WITHOUT any framework:

```bash
npm test
```

All tests run with zero framework dependencies!

## 🎉 You Did It!

You now have:
- ✅ Framework-agnostic business logic
- ✅ React implementation
- ✅ Vue implementation
- ✅ Both using THE SAME business logic

## Switching Frameworks

To switch from React to Vue:

1. **Keep `src/core/` unchanged** ✅
2. **Change adapter import**: `./adapters/react` → `./adapters/vue`
3. **Rewrite UI components** in Vue syntax
4. **Business logic stays identical!** ✅

## Next Steps

1. **Check out the examples**: Look at `examples/react-app/` and `examples/vue-app/`
2. **Read the architecture guide**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
3. **Compare implementations**: See [COMPARISON.md](./COMPARISON.md)
4. **Add your own features**: Start building!

## Common Patterns

### Adding a New Feature

1. Add to **Model** (if needed)
2. Add to **Service** (business logic)
3. Use in **React/Vue component** (UI)

### Sharing State Across Components

```javascript
// Initialize once
const store = new Store({ todos: [] });
const service = new TodoService(store);

// Share with all components
<ComponentA store={store} service={service} />
<ComponentB store={store} service={service} />
```

Both components automatically stay in sync!

### Persisting Data

Add to your Service (still framework-agnostic!):

```javascript
class TodoService {
  constructor(store) {
    this.store = store;
    this.loadFromStorage();
    this.store.subscribe(() => this.saveToStorage());
  }

  loadFromStorage() {
    const data = localStorage.getItem('todos');
    if (data) {
      this.store.setState({ todos: JSON.parse(data) });
    }
  }

  saveToStorage() {
    const todos = this.store.getState().todos;
    localStorage.setItem('todos', JSON.stringify(todos));
  }
}
```

This works in BOTH React and Vue without changes!

## Tips

1. **Keep `src/core/` pure**: No React, Vue, or any framework imports
2. **Use adapters**: Create thin adapters for each framework
3. **Test business logic**: Tests run without mounting components
4. **Think in layers**: UI → Adapter → Core

## Resources

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Deep dive into the architecture
- [COMPARISON.md](./COMPARISON.md) - Side-by-side React vs Vue comparison
- [examples/](./examples/) - Complete working examples

Happy coding! 🚀
