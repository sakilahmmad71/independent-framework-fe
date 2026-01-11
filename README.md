# Framework-Agnostic Application

A demonstration of clean architecture where **business logic is completely separated from UI frameworks**, allowing you to swap between React, Vue, Angular, or any other framework without changing a single line of business code.

## 🎯 Quick Navigation

**New here?** → Start with **[GETTING_STARTED.md](GETTING_STARTED.md)** ⭐

**Want to run the app?** → See **[QUICKSTART.md](QUICKSTART.md)** ⚡

**Need help?** → Check **[DOCS_INDEX.md](DOCS_INDEX.md)** 📚

## 📚 Documentation

- **[GETTING_STARTED.md](GETTING_STARTED.md)** ⭐ - Start here! Welcome guide with hands-on experiments
- **[QUICKSTART.md](QUICKSTART.md)** - Get started in 5 minutes
- **[README.md](README.md)** - This file - Complete overview and guide
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Visual diagrams and design patterns
- **[COMPARISON.md](COMPARISON.md)** - What changes between frameworks, what doesn't
- **[MIGRATION.md](MIGRATION.md)** - Step-by-step guide to add Vue/Angular
- **[SUMMARY.md](SUMMARY.md)** - Project achievements and next steps
- **[PROJECT_FILES.md](PROJECT_FILES.md)** - Complete file structure guide
- **[DOCS_INDEX.md](DOCS_INDEX.md)** - Documentation navigation and index

## 🎯 Architecture Overview

```
src/
├── core/                      # ✅ Framework-agnostic business logic
│   ├── models/                # Domain models (entities, DTOs)
│   ├── repositories/          # Data access interfaces & implementations
│   ├── use-cases/            # Business logic operations
│   └── index.ts              # Core exports
│
└── ui/                        # 🎨 Framework-specific UI layers
    ├── react/                 # React implementation (current)
    │   ├── components/
    │   ├── hooks/
    │   ├── providers/
    │   └── main.tsx
    │
    ├── vue/                   # Vue implementation (future)
    └── angular/               # Angular implementation (future)
```

## 🔑 Key Principles

### 1. **Core Layer (Business Logic)**

- **100% framework-agnostic** - no React, Vue, or Angular dependencies
- Pure TypeScript/JavaScript
- Contains all domain models, use cases, and business rules
- Can be tested independently without any UI framework
- Can be reused across different UI frameworks

### 2. **UI Layer (Framework-Specific)**

- Thin adapter layer that connects UI framework to core logic
- Only handles:
  - Framework-specific rendering
  - User interactions
  - State management (framework hooks/stores)
  - Routing (if needed)
- **Never contains business logic**

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Run React Version

```bash
npm run dev:react
```

Visit: `http://localhost:5173`

### Build React Version

```bash
npm run build:react
```

## 📁 Project Structure Explained

### Core Business Logic (`src/core/`)

#### Models

```typescript
// src/core/models/Todo.ts
export interface Todo {
	id: string;
	title: string;
	completed: boolean;
	createdAt: Date;
}
```

#### Repositories (Data Access)

```typescript
// src/core/repositories/ITodoRepository.ts
export interface ITodoRepository {
	getAll(): Promise<Todo[]>;
	create(data: CreateTodoDTO): Promise<Todo>;
	// ... other methods
}
```

#### Use Cases (Business Logic)

```typescript
// src/core/use-cases/TodoUseCases.ts
export class TodoUseCases {
	constructor(private repository: ITodoRepository) {}

	async createTodo(data: CreateTodoDTO) {
		// Business rules here
		if (!data.title.trim()) {
			throw new Error('Todo title cannot be empty');
		}
		return this.repository.create(data);
	}
}
```

### React UI Layer (`src/ui/react/`)

#### Provider (Dependency Injection)

```typescript
// src/ui/react/providers/TodoProvider.tsx
const todoRepository = new InMemoryTodoRepository();
const todoUseCases = new TodoUseCases(todoRepository);

export const TodoProvider = ({ children }) => (
	<TodoUseCasesContext.Provider value={todoUseCases}>{children}</TodoUseCasesContext.Provider>
);
```

#### Hooks (React-specific adapter)

```typescript
// src/ui/react/hooks/useTodos.ts
export const useTodos = () => {
  const todoUseCases = useTodoUseCases();
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = async (title: string) => {
    await todoUseCases.createTodo({ title });
    // Update React state
  };

  return { todos, addTodo, ... };
};
```

## 🔄 Switching to Vue.js

To add Vue.js as an alternative UI framework:

### 1. Install Vue Dependencies

```bash
npm install vue
npm install -D @vitejs/plugin-vue
```

### 2. Create Vue UI Layer Structure

```
src/ui/vue/
├── components/
│   └── TodoApp.vue
├── composables/
│   └── useTodos.ts
├── main.ts
├── App.vue
└── vite.config.ts
```

### 3. Create Vue Composable (uses same core logic!)

```typescript
// src/ui/vue/composables/useTodos.ts
import { ref, onMounted } from 'vue';
import { TodoUseCases, InMemoryTodoRepository } from '@core';

const todoRepository = new InMemoryTodoRepository();
const todoUseCases = new TodoUseCases(todoRepository);

export function useTodos() {
  const todos = ref([]);

  const addTodo = async (title: string) => {
    await todoUseCases.createTodo({ title });
    await loadTodos();
  };

  return { todos, addTodo, ... };
}
```

### 4. Create Vue Component

```vue
<!-- src/ui/vue/components/TodoApp.vue -->
<template>
	<div class="todo-app">
		<h1>Todo App - Vue</h1>
		<p>UI Framework: Vue (Business Logic: Framework-Agnostic)</p>

		<form @submit.prevent="handleSubmit">
			<input v-model="inputValue" placeholder="What needs to be done?" />
			<button type="submit">Add</button>
		</form>

		<div v-for="todo in todos" :key="todo.id">
			{{ todo.title }}
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useTodos } from '../composables/useTodos';

const { todos, addTodo } = useTodos();
const inputValue = ref('');

const handleSubmit = async () => {
	if (inputValue.value.trim()) {
		await addTodo(inputValue.value);
		inputValue.value = '';
	}
};
</script>
```

### 5. Add npm Scripts

```json
{
	"scripts": {
		"dev:vue": "vite --config src/ui/vue/vite.config.ts",
		"build:vue": "vite build --config src/ui/vue/vite.config.ts"
	}
}
```

### 6. Run Vue Version

```bash
npm run dev:vue
```

## 🔄 Switching to Angular

Similar pattern - create an Angular service that uses the core business logic:

```typescript
// src/ui/angular/services/todo.service.ts
import { Injectable } from '@angular/core';
import { TodoUseCases, InMemoryTodoRepository } from '@core';

@Injectable({ providedIn: 'root' })
export class TodoService {
	private todoUseCases: TodoUseCases;

	constructor() {
		const repository = new InMemoryTodoRepository();
		this.todoUseCases = new TodoUseCases(repository);
	}

	async createTodo(title: string) {
		return this.todoUseCases.createTodo({ title });
	}
}
```

## 🧪 Testing

### Test Core Logic Independently

```typescript
// tests/core/TodoUseCases.test.ts
import { TodoUseCases, InMemoryTodoRepository } from '@core';

describe('TodoUseCases', () => {
	it('should create a todo', async () => {
		const repository = new InMemoryTodoRepository();
		const useCases = new TodoUseCases(repository);

		const todo = await useCases.createTodo({ title: 'Test' });

		expect(todo.title).toBe('Test');
		expect(todo.completed).toBe(false);
	});
});
```

## 📊 Benefits of This Architecture

### ✅ Framework Independence

- Switch UI frameworks without rewriting business logic
- Experiment with new frameworks easily
- Future-proof your application

### ✅ Testability

- Test business logic without rendering components
- Mock repositories easily
- Fast unit tests

### ✅ Maintainability

- Clear separation of concerns
- Business logic in one place
- Easy to understand and modify

### ✅ Reusability

- Use same logic in web, mobile, desktop
- Share code between projects
- Build component libraries

### ✅ Team Collaboration

- Backend devs can work on core logic
- Frontend devs can work on UI independently
- Clear boundaries between layers

## 🎓 Best Practices

1. **Never import UI framework code in core layer**

   - ❌ Don't: `import { useState } from 'react'` in core
   - ✅ Do: Keep core 100% framework-agnostic

2. **Use dependency injection for repositories**

   - Allows easy swapping of data sources
   - Makes testing easier

3. **Keep business rules in use cases**

   - ❌ Don't: Validate in React components
   - ✅ Do: Validate in TodoUseCases

4. **UI layer is thin**
   - Only handles framework-specific concerns
   - Delegates everything else to core

## 🔗 Real-World Extensions

### API Integration

Replace `InMemoryTodoRepository` with `ApiTodoRepository`:

```typescript
// src/core/repositories/ApiTodoRepository.ts
export class ApiTodoRepository implements ITodoRepository {
	async getAll(): Promise<Todo[]> {
		const response = await fetch('/api/todos');
		return response.json();
	}
	// ... other methods
}
```

Then update the provider:

```typescript
const todoRepository = new ApiTodoRepository(); // ✅ No UI code changes!
```

### State Management

Add Redux, Zustand, Pinia, NgRx - all consuming the same core logic.

### Multiple Apps

- Admin dashboard (React)
- Customer portal (Vue)
- Mobile app (React Native)
- All sharing the same business logic!

## 📝 License

MIT

---

**The key insight**: Your business logic should work the same whether you're using React, Vue, Angular, Svelte, or even a command-line interface. By keeping it framework-agnostic, you have ultimate flexibility.
