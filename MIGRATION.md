# Migration Guide: Framework Switching

This guide shows you exactly how to add new UI frameworks to your application while keeping the same business logic.

## Current State

- ✅ React implementation complete
- ✅ Core business logic (framework-agnostic)
- 📝 Ready to add Vue, Angular, or any other framework

---

## Option 1: Add Vue.js

### Step 1: Install Dependencies

```bash
npm install vue
npm install -D @vitejs/plugin-vue @vue/tsconfig
```

### Step 2: Create Vue Config

Create `src/ui/vue/vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
	plugins: [vue()],
	root: path.resolve(__dirname),
	resolve: {
		alias: {
			'@core': path.resolve(__dirname, '../../core'),
			'@ui': path.resolve(__dirname, '..'),
		},
	},
	build: {
		outDir: path.resolve(__dirname, '../../dist/vue'),
	},
});
```

### Step 3: Create index.html

Create `index-vue.html` in project root:

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Framework-Agnostic App - Vue</title>
	</head>
	<body>
		<div id="app"></div>
		<script type="module" src="/src/ui/vue/main.ts"></script>
	</body>
</html>
```

### Step 4: Create Vue Composable

Create `src/ui/vue/composables/useTodos.ts`:

```typescript
import { ref, onMounted } from 'vue';
import { TodoUseCases, InMemoryTodoRepository, Todo } from '@core';

// Create singleton instances (same as React!)
const todoRepository = new InMemoryTodoRepository();
const todoUseCases = new TodoUseCases(todoRepository);

export function useTodos() {
	const todos = ref<Todo[]>([]);
	const loading = ref(false);
	const error = ref<string | null>(null);

	const loadTodos = async () => {
		try {
			loading.value = true;
			todos.value = await todoUseCases.getAllTodos();
			error.value = null;
		} catch (err) {
			error.value = err instanceof Error ? err.message : 'Failed to load todos';
		} finally {
			loading.value = false;
		}
	};

	const addTodo = async (title: string) => {
		try {
			await todoUseCases.createTodo({ title });
			await loadTodos();
		} catch (err) {
			error.value = err instanceof Error ? err.message : 'Failed to add todo';
		}
	};

	const toggleTodo = async (id: string) => {
		try {
			await todoUseCases.toggleTodo(id);
			await loadTodos();
		} catch (err) {
			error.value = err instanceof Error ? err.message : 'Failed to toggle todo';
		}
	};

	const deleteTodo = async (id: string) => {
		try {
			await todoUseCases.deleteTodo(id);
			await loadTodos();
		} catch (err) {
			error.value = err instanceof Error ? err.message : 'Failed to delete todo';
		}
	};

	onMounted(() => {
		loadTodos();
	});

	return {
		todos,
		loading,
		error,
		addTodo,
		toggleTodo,
		deleteTodo,
		refresh: loadTodos,
	};
}
```

### Step 5: Create Vue Component

Create `src/ui/vue/components/TodoApp.vue`:

```vue
<template>
	<div class="todo-app">
		<h1>Todo App - Vue</h1>
		<p class="framework-note">UI Framework: Vue (Business Logic: Framework-Agnostic)</p>

		<form @submit.prevent="handleSubmit" class="todo-form">
			<input
				v-model="inputValue"
				type="text"
				placeholder="What needs to be done?"
				class="todo-input" />
			<button type="submit" class="add-button">Add</button>
		</form>

		<div v-if="error" class="error">{{ error }}</div>

		<div v-if="loading" class="loading">Loading...</div>
		<template v-else>
			<div class="stats">
				<span>Active: {{ activeTodos.length }}</span>
				<span>Completed: {{ completedTodos.length }}</span>
				<span>Total: {{ todos.length }}</span>
			</div>

			<div class="todo-list">
				<p v-if="todos.length === 0" class="empty-state">No todos yet. Add one above!</p>
				<div
					v-for="todo in todos"
					:key="todo.id"
					:class="['todo-item', { completed: todo.completed }]">
					<input
						type="checkbox"
						:checked="todo.completed"
						@change="toggleTodo(todo.id)"
						class="todo-checkbox" />
					<span class="todo-title">{{ todo.title }}</span>
					<button @click="deleteTodo(todo.id)" class="delete-button">Delete</button>
				</div>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTodos } from '../composables/useTodos';

const { todos, loading, error, addTodo, toggleTodo, deleteTodo } = useTodos();
const inputValue = ref('');

const activeTodos = computed(() => todos.value.filter((todo) => !todo.completed));
const completedTodos = computed(() => todos.value.filter((todo) => todo.completed));

const handleSubmit = async () => {
	if (inputValue.value.trim()) {
		await addTodo(inputValue.value);
		inputValue.value = '';
	}
};
</script>

<style scoped>
/* Copy the same CSS from React version */
.todo-app {
	max-width: 600px;
	margin: 0 auto;
	padding: 2rem;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

h1 {
	color: #333;
	text-align: center;
	margin-bottom: 0.5rem;
}

.framework-note {
	text-align: center;
	color: #666;
	font-size: 0.9rem;
	margin-bottom: 2rem;
	font-style: italic;
}

/* ... rest of the CSS ... */
</style>
```

### Step 6: Create Main Entry

Create `src/ui/vue/main.ts`:

```typescript
import { createApp } from 'vue';
import App from './App.vue';
import './index.css';

createApp(App).mount('#app');
```

Create `src/ui/vue/App.vue`:

```vue
<template>
	<TodoApp />
</template>

<script setup lang="ts">
import TodoApp from './components/TodoApp.vue';
</script>
```

### Step 7: Update package.json

Add scripts:

```json
{
	"scripts": {
		"dev:vue": "vite --config src/ui/vue/vite.config.ts",
		"build:vue": "vite build --config src/ui/vue/vite.config.ts"
	}
}
```

### Step 8: Run Vue Version

```bash
npm run dev:vue
```

### 🎉 Result

- Vue app running with **exact same business logic** as React
- **Zero changes to core layer**
- Can run both React and Vue versions simultaneously (different ports)

---

## Option 2: Add Angular

### Step 1: Install Angular CLI

```bash
npm install -g @angular/cli
cd src/ui
ng new angular --routing=false --style=css
cd ../..
```

### Step 2: Create Angular Service

Create `src/ui/angular/src/app/services/todo.service.ts`:

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TodoUseCases, InMemoryTodoRepository, Todo } from '@core';

@Injectable({
	providedIn: 'root',
})
export class TodoService {
	private todoUseCases: TodoUseCases;
	private todosSubject = new BehaviorSubject<Todo[]>([]);
	public todos$: Observable<Todo[]> = this.todosSubject.asObservable();

	constructor() {
		const repository = new InMemoryTodoRepository();
		this.todoUseCases = new TodoUseCases(repository);
		this.loadTodos();
	}

	async loadTodos() {
		const todos = await this.todoUseCases.getAllTodos();
		this.todosSubject.next(todos);
	}

	async createTodo(title: string) {
		await this.todoUseCases.createTodo({ title });
		await this.loadTodos();
	}

	async toggleTodo(id: string) {
		await this.todoUseCases.toggleTodo(id);
		await this.loadTodos();
	}

	async deleteTodo(id: string) {
		await this.todoUseCases.deleteTodo(id);
		await this.loadTodos();
	}
}
```

### Step 3: Create Angular Component

Create `src/ui/angular/src/app/components/todo-app/todo-app.component.ts`:

```typescript
import { Component, OnInit } from '@angular/core';
import { TodoService } from '../../services/todo.service';
import { Todo } from '@core';

@Component({
	selector: 'app-todo-app',
	templateUrl: './todo-app.component.html',
	styleUrls: ['./todo-app.component.css'],
})
export class TodoAppComponent implements OnInit {
	todos: Todo[] = [];
	inputValue = '';

	constructor(private todoService: TodoService) {}

	ngOnInit() {
		this.todoService.todos$.subscribe((todos) => {
			this.todos = todos;
		});
	}

	async handleSubmit() {
		if (this.inputValue.trim()) {
			await this.todoService.createTodo(this.inputValue);
			this.inputValue = '';
		}
	}

	async toggleTodo(id: string) {
		await this.todoService.toggleTodo(id);
	}

	async deleteTodo(id: string) {
		await this.todoService.deleteTodo(id);
	}

	get activeTodos() {
		return this.todos.filter((todo) => !todo.completed);
	}

	get completedTodos() {
		return this.todos.filter((todo) => todo.completed);
	}
}
```

### 🎉 Result

- Angular app using **same business logic** as React and Vue
- **Zero changes to core layer**
- All three frameworks can coexist

---

## Comparison Table

| Aspect                   | React           | Vue          | Angular         |
| ------------------------ | --------------- | ------------ | --------------- |
| **Core Logic**           | ✅ Same         | ✅ Same      | ✅ Same         |
| **Adapter Pattern**      | Context + Hooks | Composables  | Services        |
| **State Management**     | useState        | ref/reactive | BehaviorSubject |
| **Lifecycle**            | useEffect       | onMounted    | ngOnInit        |
| **Code Changes to Core** | ❌ None         | ❌ None      | ❌ None         |

---

## Key Takeaways

### What Stays the Same

- ✅ All business logic in `src/core/`
- ✅ Models, repositories, use cases
- ✅ Validation rules
- ✅ Data transformations
- ✅ API calls (if using ApiRepository)

### What Changes

- 🎨 Component syntax (JSX vs Template vs HTML)
- 🎨 State management approach
- 🎨 Lifecycle hooks
- 🎨 Event handling syntax
- 🎨 Styling approach

### The Magic

**You can switch UI frameworks by only changing the `src/ui/` folder!**

The core business logic remains untouched, tested, and reliable regardless of your UI framework choice.

---

## Testing Across Frameworks

All frameworks can use the same core tests:

```typescript
// tests/core/TodoUseCases.test.ts
import { TodoUseCases, InMemoryTodoRepository } from '@core';

describe('TodoUseCases (Framework Agnostic)', () => {
	let useCases: TodoUseCases;

	beforeEach(() => {
		const repository = new InMemoryTodoRepository();
		useCases = new TodoUseCases(repository);
	});

	it('creates a todo', async () => {
		const todo = await useCases.createTodo({ title: 'Test' });
		expect(todo.title).toBe('Test');
	});

	it('validates empty titles', async () => {
		await expect(useCases.createTodo({ title: '' })).rejects.toThrow('Todo title cannot be empty');
	});
});
```

These tests work for **all UI implementations** because the business logic is framework-agnostic!
