# Framework-Independent Frontend Architecture

This project demonstrates how to build a frontend application where **business logic is completely separated from the UI framework**, allowing you to switch between React, Vue, or any other framework without changing the core business logic.

## 🎯 Problem Solved

You want to build an app where:
- Business logic is framework-agnostic
- You can start with React and later switch to Vue (or vice versa)
- **No changes to business logic are needed when switching frameworks**

## 🏗️ Architecture Overview

The architecture follows a **layered approach** with clear separation of concerns:

```
┌─────────────────────────────────────────────┐
│          UI Layer (Framework-Specific)      │
│         React Components / Vue Components   │
└─────────────────────────────────────────────┘
                      ↕
┌─────────────────────────────────────────────┐
│         Adapter Layer (Framework Bridge)     │
│      React Hooks / Vue Composables          │
└─────────────────────────────────────────────┘
                      ↕
┌─────────────────────────────────────────────┐
│      Core Layer (Framework-Agnostic)        │
│   Models → Services → Store (Pure JS)      │
└─────────────────────────────────────────────┘
```

### Core Principles

1. **Framework-Agnostic Core**: All business logic is written in pure JavaScript/TypeScript with no framework dependencies
2. **Adapter Pattern**: Thin adapter layer connects framework-specific features to the core
3. **Observable Store**: Simple state management that works with any framework
4. **Dependency Injection**: Services and stores are injected, not framework-coupled

## 📁 Project Structure

```
src/
├── core/                          # Framework-agnostic business logic
│   ├── models/                    # Domain models (Todo, User, etc.)
│   │   └── Todo.js               # Pure business entities
│   ├── services/                  # Business logic services
│   │   └── TodoService.js        # Use cases and operations
│   ├── store/                     # State management
│   │   └── Store.js              # Observable store pattern
│   └── index.js                  # Core exports
│
├── adapters/                      # Framework-specific adapters
│   ├── react/                     # React integration
│   │   ├── useStore.js           # React hooks for store
│   │   └── index.js
│   └── vue/                       # Vue integration
│       ├── useStore.js           # Vue composables for store
│       └── index.js
│
└── examples/                      # Example implementations
    ├── react-app/                 # React example
    │   ├── TodoApp.jsx
    │   ├── index.jsx
    │   └── index.html
    └── vue-app/                   # Vue example
        ├── TodoApp.vue
        ├── index.js
        └── index.html
```

## 🔑 Key Components

### 1. Core Layer (Framework-Agnostic)

#### Models (`src/core/models/`)
Pure business entities with no framework dependencies:

```javascript
import { Todo } from './core/models/Todo.js';

const todo = new Todo(1, 'Learn architecture');
const updated = todo.toggle(); // Immutable operations
```

#### Services (`src/core/services/`)
Business logic and use cases:

```javascript
import { TodoService } from './core/services/TodoService.js';

const service = new TodoService(store);
service.addTodo('New task');
service.toggleTodo(todoId);
const stats = service.getStats();
```

#### Store (`src/core/store/`)
Observable state management:

```javascript
import { Store } from './core/store/Store.js';

const store = new Store({ todos: [] });
store.subscribe((state) => console.log('State changed:', state));
store.setState({ todos: [...newTodos] });
```

### 2. Adapter Layer

#### React Adapter (`src/adapters/react/`)

```javascript
import { useStore } from './adapters/react';

function MyComponent({ store, todoService }) {
  const state = useStore(store); // React hook
  // Use state.todos in your component
}
```

#### Vue Adapter (`src/adapters/vue/`)

```javascript
import { useStore } from './adapters/vue';

const state = useStore(store); // Vue composable
// Use state.value.todos in your component
```

### 3. UI Layer (Framework-Specific)

Both React and Vue components use **the same business logic** but with framework-specific rendering.

## 🚀 Usage

### Using with React

```javascript
import React from 'react';
import { Store, TodoService } from './src/core';
import { useStore } from './src/adapters/react';

// Initialize core (framework-agnostic)
const store = new Store({ todos: [] });
const todoService = new TodoService(store);

// Use in React component
function TodoApp() {
  const state = useStore(store);
  
  return (
    <div>
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

### Using with Vue

```vue
<template>
  <div>
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
import { Store, TodoService } from './src/core';
import { useStore } from './src/adapters/vue';

// Initialize core (framework-agnostic)
const store = new Store({ todos: [] });
const todoService = new TodoService(store);

// Use in Vue component
const state = useStore(store);
</script>
```

## 🔄 Switching Frameworks

To switch from React to Vue (or vice versa):

1. **Keep the entire `src/core/` directory** - No changes needed! ✅
2. **Only change the adapter import**:
   - From: `import { useStore } from './adapters/react'`
   - To: `import { useStore } from './adapters/vue'`
3. **Rewrite UI components** in the new framework syntax
4. **Business logic remains identical** - Same services, same models, same store

### Example: Adding a New Feature

When adding a new feature (e.g., "Archive Todo"):

1. **Add to Model** (framework-agnostic):
```javascript
// src/core/models/Todo.js
archive() {
  return new Todo(this.id, this.title, this.completed, this.createdAt, true);
}
```

2. **Add to Service** (framework-agnostic):
```javascript
// src/core/services/TodoService.js
archiveTodo(id) {
  const todos = this.store.getState().todos.map(todo =>
    todo.id === id ? todo.archive() : todo
  );
  this.store.setState({ todos });
}
```

3. **Use in React** OR **Vue** (framework-specific UI only):
```javascript
// React
<button onClick={() => todoService.archiveTodo(todo.id)}>Archive</button>

// Vue
<button @click="todoService.archiveTodo(todo.id)">Archive</button>
```

The business logic (steps 1-2) is written **once** and works in **both frameworks**!

## 🧪 Testing Strategy

### Test Business Logic (Framework-Agnostic)
```javascript
import { Todo } from './src/core/models/Todo.js';
import { TodoService } from './src/core/services/TodoService.js';
import { Store } from './src/core/store/Store.js';

describe('TodoService', () => {
  it('should add a todo', () => {
    const store = new Store({ todos: [] });
    const service = new TodoService(store);
    
    service.addTodo('Test task');
    
    expect(store.getState().todos).toHaveLength(1);
    expect(store.getState().todos[0].title).toBe('Test task');
  });
});
```

These tests run **without any framework** and validate core business logic.

### Test UI Components (Framework-Specific)
- React: Use React Testing Library
- Vue: Use Vue Test Utils

## 📋 Benefits

1. **Framework Independence**: Switch frameworks without rewriting business logic
2. **Better Testability**: Test business logic without mounting components
3. **Clear Separation**: Each layer has a single responsibility
4. **Reusability**: Share business logic across different apps
5. **Migration Safety**: Gradual migration between frameworks
6. **Team Flexibility**: Frontend and backend logic can be developed independently

## 🛠️ Development

### Running React Example
```bash
# Install dependencies (when build tools are configured)
npm install

# Run React dev server
npm run dev:react
```

### Running Vue Example
```bash
# Run Vue dev server
npm run dev:vue
```

## 🎓 Learning Points

1. **Domain Models**: Business entities that represent your data and operations
2. **Services**: Coordinate operations and enforce business rules
3. **Observable Store**: Simple state management pattern that works everywhere
4. **Adapter Pattern**: Bridge between framework-specific and framework-agnostic code
5. **Dependency Injection**: Pass dependencies (store, services) rather than importing them

## 🌟 Next Steps

To extend this architecture:

1. **Add more models**: User, Project, Category, etc.
2. **Add persistence**: LocalStorage, IndexedDB, or API integration (still framework-agnostic!)
3. **Add routing**: Use framework-specific routers (React Router, Vue Router)
4. **Add validation**: In the model/service layer (framework-agnostic)
5. **Add other frameworks**: Angular, Svelte, Solid - just create new adapters!

## 📚 Additional Resources

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Adapter Pattern](https://refactoring.guru/design-patterns/adapter)

## 📄 License

MIT
