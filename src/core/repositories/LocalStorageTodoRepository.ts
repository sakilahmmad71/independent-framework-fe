// Example: LocalStorage-based repository implementation
// Another example of swapping data sources

import { Todo, CreateTodoDTO, UpdateTodoDTO } from '../models/Todo';
import { ITodoRepository } from './ITodoRepository';

export class LocalStorageTodoRepository implements ITodoRepository {
	private storageKey = 'todos';

	private getTodos(): Todo[] {
		const data = localStorage.getItem(this.storageKey);
		if (!data) return [];

		const todos = JSON.parse(data);
		// Convert date strings back to Date objects
		return todos.map((todo: any) => ({
			...todo,
			createdAt: new Date(todo.createdAt),
		}));
	}

	private saveTodos(todos: Todo[]): void {
		localStorage.setItem(this.storageKey, JSON.stringify(todos));
	}

	async getAll(): Promise<Todo[]> {
		return this.getTodos();
	}

	async getAllByUserId(userId: string): Promise<Todo[]> {
		const todos = this.getTodos();
		return todos.filter((todo) => todo.userId === userId);
	}

	async getById(id: string): Promise<Todo | null> {
		const todos = this.getTodos();
		return todos.find((todo) => todo.id === id) || null;
	}

	async create(data: CreateTodoDTO, userId: string): Promise<Todo> {
		const todos = this.getTodos();
		const newTodo: Todo = {
			id: crypto.randomUUID(),
			title: data.title,
			completed: false,
			userId,
			createdAt: new Date(),
		};
		todos.push(newTodo);
		this.saveTodos(todos);
		return newTodo;
	}

	async update(data: UpdateTodoDTO): Promise<Todo> {
		const todos = this.getTodos();
		const index = todos.findIndex((todo) => todo.id === data.id);

		if (index === -1) {
			throw new Error(`Todo with id ${data.id} not found`);
		}

		todos[index] = {
			...todos[index],
			...(data.title !== undefined && { title: data.title }),
			...(data.completed !== undefined && { completed: data.completed }),
		};

		this.saveTodos(todos);
		return todos[index];
	}

	async delete(id: string): Promise<void> {
		const todos = this.getTodos();
		const filteredTodos = todos.filter((todo) => todo.id !== id);

		if (filteredTodos.length === todos.length) {
			throw new Error(`Todo with id ${id} not found`);
		}

		this.saveTodos(filteredTodos);
	}
}

// To use this instead of InMemoryTodoRepository:
// 1. Update your provider/composable/service:
//    const todoRepository = new LocalStorageTodoRepository();
//
// 2. That's it! Now todos persist in browser storage.
//    - Same business logic
//    - Same UI
//    - Just different storage mechanism
