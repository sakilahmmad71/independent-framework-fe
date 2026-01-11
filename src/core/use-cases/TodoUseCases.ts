// Use Cases - Business logic operations (framework-agnostic)
import { ITodoRepository } from '../repositories/ITodoRepository';
import { CreateTodoDTO, UpdateTodoDTO } from '../models/Todo';

export class TodoUseCases {
	constructor(private repository: ITodoRepository) {}

	async getAllTodos(userId?: string) {
		if (userId) {
			return this.repository.getAllByUserId(userId);
		}
		return this.repository.getAll();
	}

	async getTodoById(id: string, userId?: string) {
		const todo = await this.repository.getById(id);

		// Authorization: Only allow access if user owns the todo
		if (todo && userId && todo.userId !== userId) {
			throw new Error('Unauthorized: You do not have access to this todo');
		}

		return todo;
	}

	async createTodo(data: CreateTodoDTO, userId: string) {
		if (!userId) {
			throw new Error('Authentication required to create todos');
		}

		if (!data.title.trim()) {
			throw new Error('Todo title cannot be empty');
		}

		return this.repository.create(data, userId);
	}

	async updateTodo(data: UpdateTodoDTO, userId?: string) {
		if (data.title !== undefined && !data.title.trim()) {
			throw new Error('Todo title cannot be empty');
		}

		// Authorization: Check ownership before update
		if (userId) {
			const existingTodo = await this.repository.getById(data.id);
			if (existingTodo && existingTodo.userId !== userId) {
				throw new Error('Unauthorized: You can only update your own todos');
			}
		}

		return this.repository.update(data);
	}

	async toggleTodo(id: string, userId?: string) {
		const todo = await this.repository.getById(id);
		if (!todo) {
			throw new Error(`Todo with id ${id} not found`);
		}

		// Authorization: Check ownership before toggle
		if (userId && todo.userId !== userId) {
			throw new Error('Unauthorized: You can only toggle your own todos');
		}

		return this.repository.update({
			id,
			completed: !todo.completed,
		});
	}

	async deleteTodo(id: string, userId?: string) {
		// Authorization: Check ownership before delete
		if (userId) {
			const todo = await this.repository.getById(id);
			if (todo && todo.userId !== userId) {
				throw new Error('Unauthorized: You can only delete your own todos');
			}
		}

		return this.repository.delete(id);
	}

	async getActiveTodosCount(userId?: string) {
		const todos = await this.getAllTodos(userId);
		return todos.filter((todo) => !todo.completed).length;
	}

	async getCompletedTodosCount(userId?: string) {
		const todos = await this.getAllTodos(userId);
		return todos.filter((todo) => todo.completed).length;
	}
}
