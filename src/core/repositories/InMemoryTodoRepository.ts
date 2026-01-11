// In-memory implementation of repository
// Can be replaced with API, IndexedDB, etc.
import { Todo, CreateTodoDTO, UpdateTodoDTO } from '../models/Todo';
import { ITodoRepository } from './ITodoRepository';

export class InMemoryTodoRepository implements ITodoRepository {
	private todos: Todo[] = [];

	async getAll(): Promise<Todo[]> {
		return [...this.todos];
	}

	async getAllByUserId(userId: string): Promise<Todo[]> {
		return this.todos.filter((todo) => todo.userId === userId);
	}

	async getById(id: string): Promise<Todo | null> {
		return this.todos.find((todo) => todo.id === id) || null;
	}

	async create(data: CreateTodoDTO, userId: string): Promise<Todo> {
		const newTodo: Todo = {
			id: crypto.randomUUID(),
			title: data.title,
			completed: false,
			userId,
			createdAt: new Date(),
		};
		this.todos.push(newTodo);
		return newTodo;
	}

	async update(data: UpdateTodoDTO): Promise<Todo> {
		const index = this.todos.findIndex((todo) => todo.id === data.id);
		if (index === -1) {
			throw new Error(`Todo with id ${data.id} not found`);
		}

		this.todos[index] = {
			...this.todos[index],
			...(data.title !== undefined && { title: data.title }),
			...(data.completed !== undefined && { completed: data.completed }),
		};

		return this.todos[index];
	}

	async delete(id: string): Promise<void> {
		const index = this.todos.findIndex((todo) => todo.id === id);
		if (index === -1) {
			throw new Error(`Todo with id ${id} not found`);
		}
		this.todos.splice(index, 1);
	}
}
