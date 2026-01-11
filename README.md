# Independent Framework Frontend

A demonstration of framework-independent frontend architecture where business logic is completely separated from UI framework/library code. This allows you to switch between different frameworks (React, Vue, Svelte, etc.) without changing any business logic.

## 🎯 Problem Statement

Modern frontend applications are often tightly coupled to specific frameworks. This repository demonstrates how to:

- Separate business logic from UI framework dependencies
- Make business logic reusable across different frameworks
- Switch frameworks without modifying business logic
- Maintain testable, framework-agnostic code

## 🏗️ Architecture

The architecture follows the **Ports and Adapters (Hexagonal Architecture)** pattern:

```
┌─────────────────────────────────────────────────────────┐
│                     UI Layer                            │
│         (React, Vue, Svelte, Vanilla JS)               │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│                  Adapters                               │
│     (InMemoryRepository, LocalStorageRepository)        │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│                 Core Business Logic                     │
│            (Framework Independent)                      │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Entities   │  │   Use Cases  │  │    Ports     │ │
│  │  (Todo, User)│  │ (TodoUseCase)│  │ (Interfaces) │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Core Components

#### 1. **Entities** (`src/core/entities/`)
Pure TypeScript interfaces representing business domain objects.
- `Todo.ts` - Todo item entity
- `User.ts` - User and authentication entities

#### 2. **Use Cases** (`src/core/usecases/`)
Framework-independent business logic.
- `TodoUseCase.ts` - Todo management operations with business rules
- `AuthUseCase.ts` - Authentication operations with business rules

#### 3. **Ports** (`src/core/ports/`)
Interfaces that define how business logic communicates with external systems.
- `TodoRepository.ts` - Interface for todo persistence
- `AuthRepository.ts` - Interface for authentication
- `Observable.ts` - Observer pattern for state management

#### 4. **Adapters** (`src/adapters/`)
Concrete implementations of ports that can work with any framework.
- `InMemoryTodoRepository.ts` - In-memory storage
- `InMemoryAuthRepository.ts` - Mock authentication
- `LocalStorageTodoRepository.ts` - Browser localStorage

## 🚀 Usage Examples

### React Integration

```typescript
import { useState, useEffect } from 'react';
import { TodoUseCase } from './core/usecases/TodoUseCase';
import { InMemoryTodoRepository } from './adapters/InMemoryTodoRepository';

function useTodoUseCase() {
  const [todoUseCase] = useState(() => new TodoUseCase(new InMemoryTodoRepository()));
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    const unsubscribe = todoUseCase.subscribeTodos(setTodos);
    todoUseCase.loadTodos();
    return unsubscribe;
  }, [todoUseCase]);

  return { todos, createTodo: todoUseCase.createTodo.bind(todoUseCase) };
}
```

### Vue Integration

```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { TodoUseCase } from './core/usecases/TodoUseCase';
import { InMemoryTodoRepository } from './adapters/InMemoryTodoRepository';

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
</script>
```

### Vanilla JavaScript Integration

```javascript
import { TodoUseCase } from './core/usecases/TodoUseCase';
import { InMemoryTodoRepository } from './adapters/InMemoryTodoRepository';

const todoUseCase = new TodoUseCase(new InMemoryTodoRepository());

todoUseCase.subscribeTodos((todos) => {
  renderTodos(todos);
});

todoUseCase.loadTodos();
```

## 📁 Project Structure

```
independent-framework-fe/
├── src/
│   ├── core/                    # Framework-independent business logic
│   │   ├── entities/           # Domain entities
│   │   │   ├── Todo.ts
│   │   │   └── User.ts
│   │   ├── usecases/           # Business logic
│   │   │   ├── TodoUseCase.ts
│   │   │   └── AuthUseCase.ts
│   │   ├── ports/              # Interfaces
│   │   │   ├── TodoRepository.ts
│   │   │   ├── AuthRepository.ts
│   │   │   └── Observable.ts
│   │   ├── __tests__/          # Unit tests
│   │   │   ├── TodoUseCase.test.ts
│   │   │   └── AuthUseCase.test.ts
│   │   └── index.ts            # Core exports
│   └── adapters/               # Repository implementations
│       ├── InMemoryTodoRepository.ts
│       ├── InMemoryAuthRepository.ts
│       └── LocalStorageTodoRepository.ts
├── examples/                   # Framework integration examples
│   ├── react/                  # React example
│   │   ├── useTodoUseCase.ts
│   │   └── TodoApp.tsx
│   ├── vue/                    # Vue example
│   │   └── TodoApp.vue
│   └── vanilla/                # Vanilla JS example
│       ├── app.ts
│       └── index.html
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## 🧪 Running Tests

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build
```

## ✨ Key Benefits

1. **Framework Independence**: Business logic has zero framework dependencies
2. **Easy Testing**: Core logic can be tested without UI frameworks
3. **Flexibility**: Switch frameworks without rewriting business logic
4. **Reusability**: Same business logic works across React, Vue, Svelte, etc.
5. **Maintainability**: Clear separation of concerns
6. **Type Safety**: Full TypeScript support

## 🔄 Adding a New Framework

To integrate with a new framework:

1. Use the core business logic from `src/core/`
2. Create framework-specific bindings (hooks, composables, etc.)
3. Subscribe to state changes using the Observable pattern
4. Call use case methods for business operations

Example for Svelte:

```svelte
<script lang="ts">
import { onMount, onDestroy } from 'svelte';
import { writable } from 'svelte/store';
import { TodoUseCase } from './core/usecases/TodoUseCase';
import { InMemoryTodoRepository } from './adapters/InMemoryTodoRepository';

const todoUseCase = new TodoUseCase(new InMemoryTodoRepository());
const todos = writable([]);

let unsubscribe;
onMount(() => {
  unsubscribe = todoUseCase.subscribeTodos(todos.set);
  todoUseCase.loadTodos();
});

onDestroy(() => unsubscribe?.());
</script>
```

## 📚 Business Rules

The business logic layer enforces rules automatically:

**Todo Management:**
- Todo title must not be empty
- Todo title must be at least 3 characters
- Completion status can be toggled

**Authentication:**
- Username must not be empty
- Password must be at least 6 characters

These rules are enforced in the use cases, ensuring consistency across all frameworks.

## 🎓 Learning Resources

This architecture is based on:
- **Hexagonal Architecture** (Ports and Adapters)
- **Clean Architecture** principles
- **Dependency Inversion** principle
- **Observer Pattern** for state management

## 📝 License

MIT