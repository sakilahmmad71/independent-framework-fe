# Framework Comparison: What Changes, What Stays the Same

This document shows **exactly** what changes when switching between frameworks, and what remains identical.

---

## 🔒 What NEVER Changes (Core Layer)

These files are **100% identical** regardless of whether you use React, Vue, Angular, or any other framework:

### ✅ Models

```typescript
// src/core/models/Todo.ts - IDENTICAL across all frameworks
export interface Todo {
	id: string;
	title: string;
	completed: boolean;
	createdAt: Date;
}

export type CreateTodoDTO = {
	title: string;
};

export type UpdateTodoDTO = {
	id: string;
	title?: string;
	completed?: boolean;
};
```

### ✅ Repository Interface

```typescript
// src/core/repositories/ITodoRepository.ts - IDENTICAL across all frameworks
export interface ITodoRepository {
	getAll(): Promise<Todo[]>;
	getById(id: string): Promise<Todo | null>;
	create(data: CreateTodoDTO): Promise<Todo>;
	update(data: UpdateTodoDTO): Promise<Todo>;
	delete(id: string): Promise<void>;
}
```

### ✅ Repository Implementations

```typescript
// src/core/repositories/InMemoryTodoRepository.ts - IDENTICAL across all frameworks
export class InMemoryTodoRepository implements ITodoRepository {
	private todos: Todo[] = [];

	async getAll(): Promise<Todo[]> {
		return [...this.todos];
	}

	async create(data: CreateTodoDTO): Promise<Todo> {
		const newTodo: Todo = {
			id: crypto.randomUUID(),
			title: data.title,
			completed: false,
			createdAt: new Date(),
		};
		this.todos.push(newTodo);
		return newTodo;
	}
	// ... other methods - ALL IDENTICAL
}
```

### ✅ Use Cases (Business Logic)

```typescript
// src/core/use-cases/TodoUseCases.ts - IDENTICAL across all frameworks
export class TodoUseCases {
	constructor(private repository: ITodoRepository) {}

	async createTodo(data: CreateTodoDTO) {
		if (!data.title.trim()) {
			throw new Error('Todo title cannot be empty');
		}
		return this.repository.create(data);
	}

	async toggleTodo(id: string) {
		const todo = await this.repository.getById(id);
		if (!todo) {
			throw new Error(`Todo with id ${id} not found`);
		}
		return this.repository.update({
			id,
			completed: !todo.completed,
		});
	}
	// ... all other methods - ALL IDENTICAL
}
```

**Lines of code that stay the same: ~200**
**Percentage of codebase: ~70-80%**

---

## 🎨 What Changes (UI Layer)

Only the framework-specific adapter code changes. Here's a side-by-side comparison:

### Dependency Injection / Setup

#### React

```typescript
// src/ui/react/providers/TodoProvider.tsx
import { createContext, useContext, ReactNode } from 'react';
import { TodoUseCases, InMemoryTodoRepository } from '@core';

const todoRepository = new InMemoryTodoRepository();
const todoUseCases = new TodoUseCases(todoRepository);

const TodoUseCasesContext = createContext<TodoUseCases | null>(null);

export const TodoProvider = ({ children }: { children: ReactNode }) => {
	return (
		<TodoUseCasesContext.Provider value={todoUseCases}>{children}</TodoUseCasesContext.Provider>
	);
};

export const useTodoUseCases = () => {
	const context = useContext(TodoUseCasesContext);
	if (!context) {
		throw new Error('useTodoUseCases must be used within TodoProvider');
	}
	return context;
};
```

#### Vue

```typescript
// src/ui/vue/composables/useTodoUseCases.ts
import { TodoUseCases, InMemoryTodoRepository } from '@core';

// Singleton instance
const todoRepository = new InMemoryTodoRepository();
const todoUseCases = new TodoUseCases(todoRepository);

export function useTodoUseCases() {
	return todoUseCases;
}
```

#### Angular

```typescript
// src/ui/angular/services/todo-use-cases.service.ts
import { Injectable } from '@angular/core';
import { TodoUseCases, InMemoryTodoRepository } from '@core';

@Injectable({
	providedIn: 'root',
})
export class TodoUseCasesService {
	private useCases: TodoUseCases;

	constructor() {
		const repository = new InMemoryTodoRepository();
		this.useCases = new TodoUseCases(repository);
	}

	getUseCases() {
		return this.useCases;
	}
}
```

**Key Point**: All three create the same `TodoUseCases` instance with the same repository. Only the DI mechanism differs.

---

### State Management Adapter

#### React (Hook)

```typescript
// src/ui/react/hooks/useTodos.ts
import { useState, useEffect } from 'react';
import { useTodoUseCases } from '../providers/TodoProvider';
import { Todo } from '@core';

export const useTodos = () => {
	const todoUseCases = useTodoUseCases();
	const [todos, setTodos] = useState<Todo[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const loadTodos = async () => {
		try {
			setLoading(true);
			const data = await todoUseCases.getAllTodos();
			setTodos(data);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed');
		} finally {
			setLoading(false);
		}
	};

	const addTodo = async (title: string) => {
		try {
			await todoUseCases.createTodo({ title });
			await loadTodos();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed');
		}
	};

	useEffect(() => {
		loadTodos();
	}, []);

	return { todos, loading, error, addTodo };
};
```

#### Vue (Composable)

```typescript
// src/ui/vue/composables/useTodos.ts
import { ref, onMounted } from 'vue';
import { useTodoUseCases } from './useTodoUseCases';
import { Todo } from '@core';

export function useTodos() {
	const todoUseCases = useTodoUseCases();
	const todos = ref<Todo[]>([]);
	const loading = ref(false);
	const error = ref<string | null>(null);

	const loadTodos = async () => {
		try {
			loading.value = true;
			const data = await todoUseCases.getAllTodos();
			todos.value = data;
			error.value = null;
		} catch (err) {
			error.value = err instanceof Error ? err.message : 'Failed';
		} finally {
			loading.value = false;
		}
	};

	const addTodo = async (title: string) => {
		try {
			await todoUseCases.createTodo({ title });
			await loadTodos();
		} catch (err) {
			error.value = err instanceof Error ? err.message : 'Failed';
		}
	};

	onMounted(() => {
		loadTodos();
	});

	return { todos, loading, error, addTodo };
}
```

#### Angular (Service + Component)

```typescript
// src/ui/angular/services/todo.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TodoUseCasesService } from './todo-use-cases.service';
import { Todo } from '@core';

@Injectable({
	providedIn: 'root',
})
export class TodoService {
	private todosSubject = new BehaviorSubject<Todo[]>([]);
	public todos$ = this.todosSubject.asObservable();

	private loadingSubject = new BehaviorSubject<boolean>(false);
	public loading$ = this.loadingSubject.asObservable();

	private errorSubject = new BehaviorSubject<string | null>(null);
	public error$ = this.errorSubject.asObservable();

	constructor(private useCasesService: TodoUseCasesService) {
		this.loadTodos();
	}

	async loadTodos() {
		try {
			this.loadingSubject.next(true);
			const useCases = this.useCasesService.getUseCases();
			const data = await useCases.getAllTodos();
			this.todosSubject.next(data);
			this.errorSubject.next(null);
		} catch (err) {
			this.errorSubject.next(err instanceof Error ? err.message : 'Failed');
		} finally {
			this.loadingSubject.next(false);
		}
	}

	async addTodo(title: string) {
		try {
			const useCases = this.useCasesService.getUseCases();
			await useCases.createTodo({ title });
			await this.loadTodos();
		} catch (err) {
			this.errorSubject.next(err instanceof Error ? err.message : 'Failed');
		}
	}
}
```

**Key Point**: All three adapters call the **exact same methods** on `TodoUseCases`. Only the state management mechanism differs (useState vs ref vs BehaviorSubject).

---

### Component/View

#### React (JSX)

```tsx
// src/ui/react/components/TodoApp.tsx
import { useState } from 'react';
import { useTodos } from '../hooks/useTodos';

export const TodoApp = () => {
	const { todos, loading, error, addTodo } = useTodos();
	const [inputValue, setInputValue] = useState('');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (inputValue.trim()) {
			await addTodo(inputValue);
			setInputValue('');
		}
	};

	return (
		<div className='todo-app'>
			<h1>Todo App - React</h1>

			<form onSubmit={handleSubmit}>
				<input
					type='text'
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					placeholder='What needs to be done?'
				/>
				<button type='submit'>Add</button>
			</form>

			{error && <div className='error'>{error}</div>}

			{loading ? (
				<div>Loading...</div>
			) : (
				<div>
					{todos.map((todo) => (
						<div key={todo.id}>
							<span>{todo.title}</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
};
```

#### Vue (Template)

```vue
<!-- src/ui/vue/components/TodoApp.vue -->
<template>
	<div class="todo-app">
		<h1>Todo App - Vue</h1>

		<form @submit.prevent="handleSubmit">
			<input v-model="inputValue" type="text" placeholder="What needs to be done?" />
			<button type="submit">Add</button>
		</form>

		<div v-if="error" class="error">{{ error }}</div>

		<div v-if="loading">Loading...</div>
		<div v-else>
			<div v-for="todo in todos" :key="todo.id">
				<span>{{ todo.title }}</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useTodos } from '../composables/useTodos';

const { todos, loading, error, addTodo } = useTodos();
const inputValue = ref('');

const handleSubmit = async () => {
	if (inputValue.value.trim()) {
		await addTodo(inputValue.value);
		inputValue.value = '';
	}
};
</script>
```

#### Angular (Template + Component)

```html
<!-- src/ui/angular/components/todo-app/todo-app.component.html -->
<div class="todo-app">
	<h1>Todo App - Angular</h1>

	<form (submit)="handleSubmit($event)">
		<input type="text" [(ngModel)]="inputValue" placeholder="What needs to be done?" />
		<button type="submit">Add</button>
	</form>

	<div *ngIf="error$ | async as error" class="error">{{ error }}</div>

	<div *ngIf="loading$ | async">Loading...</div>
	<div *ngIf="!(loading$ | async)">
		<div *ngFor="let todo of todos$ | async">
			<span>{{ todo.title }}</span>
		</div>
	</div>
</div>
```

```typescript
// src/ui/angular/components/todo-app/todo-app.component.ts
import { Component } from '@angular/core';
import { TodoService } from '../../services/todo.service';

@Component({
	selector: 'app-todo-app',
	templateUrl: './todo-app.component.html',
	styleUrls: ['./todo-app.component.css'],
})
export class TodoAppComponent {
	todos$ = this.todoService.todos$;
	loading$ = this.todoService.loading$;
	error$ = this.todoService.error$;
	inputValue = '';

	constructor(private todoService: TodoService) {}

	async handleSubmit(event: Event) {
		event.preventDefault();
		if (this.inputValue.trim()) {
			await this.todoService.addTodo(this.inputValue);
			this.inputValue = '';
		}
	}
}
```

**Key Point**: All three components render the **same data** and call the **same business logic**. Only the template syntax differs.

---

## 📊 Code Comparison Summary

| Aspect           | React            | Vue          | Angular          | Shared Core |
| ---------------- | ---------------- | ------------ | ---------------- | ----------- |
| **Models**       | -                | -            | -                | ✅ 100%     |
| **Repositories** | -                | -            | -                | ✅ 100%     |
| **Use Cases**    | -                | -            | -                | ✅ 100%     |
| **DI Setup**     | Context          | Singleton    | Service          | -           |
| **State**        | useState         | ref          | BehaviorSubject  | -           |
| **Lifecycle**    | useEffect        | onMounted    | ngOnInit         | -           |
| **Template**     | JSX              | Vue Template | Angular Template | -           |
| **Events**       | onClick          | @click       | (click)          | -           |
| **Binding**      | value + onChange | v-model      | [(ngModel)]      | -           |

### Lines of Code Breakdown

For a typical Todo app:

| Layer          | Lines of Code | Shared % |
| -------------- | ------------- | -------- |
| **Core Logic** | ~200          | 100%     |
| **UI Adapter** | ~100          | 0%       |
| **Components** | ~150          | 0%       |
| **Total**      | ~450          | ~44%     |

**Result**: ~44% of code is reusable across frameworks!

In larger apps with complex business logic:

- Core logic: ~2000 lines (70-80% of codebase)
- UI adapter: ~300 lines
- Components: ~500 lines
- **Reusable: 70-80%**

---

## 🔄 Migration Effort Comparison

### Traditional Approach (Coupled)

```
React → Vue Migration
├── Rewrite all business logic (10 days)
├── Rewrite all data access (5 days)
├── Rewrite all components (7 days)
├── Rewrite all tests (5 days)
└── Debug integration (3 days)

Total: ~30 days, HIGH RISK
```

### Framework-Agnostic Approach

```
React → Vue Migration
├── Core logic (0 days) ✅ Already done
├── Data access (0 days) ✅ Already done
├── Create Vue adapter (1 day)
├── Create Vue components (3 days)
├── Port UI tests (2 days)
└── Integration testing (1 day)

Total: ~7 days, LOW RISK
```

**Time saved: 23 days (77% reduction)**
**Risk reduction: Massive (business logic already tested)**

---

## 🎯 What You Need to Learn per Framework

### To Add React

- useState, useEffect, useContext
- JSX syntax
- Event handling (onClick, onChange)
- Props and children

### To Add Vue

- ref, reactive, computed
- Template syntax
- Event handling (@click, v-model)
- Composables pattern

### To Add Angular

- Services and dependency injection
- Template syntax
- Event handling ((click), [(ngModel)])
- Observables (RxJS)

### For All Frameworks

- **Core business logic**: Already written once!
- **Testing business logic**: Already written once!
- **Domain models**: Already defined once!

---

## 💡 Key Takeaways

### Same Everywhere

```typescript
// This code NEVER changes, regardless of framework:
await todoUseCases.createTodo({ title: 'New todo' });
await todoUseCases.toggleTodo(id);
await todoUseCases.deleteTodo(id);
```

### Different Per Framework

```typescript
// React
const [todos, setTodos] = useState([]);

// Vue
const todos = ref([]);

// Angular
todos$ = new BehaviorSubject([]);
```

### The Power

You write **business logic once**, and it works with:

- ✅ React
- ✅ Vue
- ✅ Angular
- ✅ Svelte
- ✅ React Native (mobile)
- ✅ Electron (desktop)
- ✅ Node.js CLI
- ✅ Any future JavaScript framework

---

**Bottom Line**: ~70-80% of your code stays the same when switching frameworks. You only rewrite the thin UI adapter layer.
