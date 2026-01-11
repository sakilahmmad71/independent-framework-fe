# Quick Start Guide

## Current Setup (React)

### 1. Install Dependencies

```bash
npm install
```

### 2. Run the App

```bash
npm run dev:react
```

### 3. Open Browser

Navigate to `http://localhost:5173`

## Understanding the Architecture

### What You Can Do Now

- Add todos
- Mark todos as complete
- Delete todos
- See live statistics

### The Magic ✨

All business logic is in `src/core/` - completely independent of React!

## Try This Exercise

### Switch from InMemory to Console Logging

1. Create a new repository:

```typescript
// src/core/repositories/ConsoleLogTodoRepository.ts
import { Todo, CreateTodoDTO, UpdateTodoDTO } from '../models/Todo';
import { ITodoRepository } from './ITodoRepository';

export class ConsoleLogTodoRepository implements ITodoRepository {
	private todos: Todo[] = [];

	async getAll(): Promise<Todo[]> {
		console.log('📋 Getting all todos:', this.todos);
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
		console.log('✅ Created todo:', newTodo);
		return newTodo;
	}

	// ... implement other methods with console.log
}
```

2. Update React provider:

```typescript
// src/ui/react/providers/TodoProvider.tsx
import { ConsoleLogTodoRepository } from '@core/repositories/ConsoleLogTodoRepository';

const todoRepository = new ConsoleLogTodoRepository(); // Changed!
const todoUseCases = new TodoUseCases(todoRepository);
```

3. **No other changes needed!** The UI still works perfectly.

This demonstrates how easily you can swap implementations without touching business logic or UI code.

## Next Steps

Ready to add Vue? See the main README.md for detailed instructions!
