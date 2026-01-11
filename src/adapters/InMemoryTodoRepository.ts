import { Todo, CreateTodoInput, UpdateTodoInput } from '../core/entities/Todo';
import { TodoRepository } from '../core/ports/TodoRepository';

/**
 * In-Memory implementation of TodoRepository
 * This adapter can be used with any framework for development/testing
 */
export class InMemoryTodoRepository implements TodoRepository {
  private todos: Map<string, Todo> = new Map();
  private nextId = 1;

  async getAll(): Promise<Todo[]> {
    return Array.from(this.todos.values());
  }

  async getById(id: string): Promise<Todo | null> {
    return this.todos.get(id) || null;
  }

  async create(input: CreateTodoInput): Promise<Todo> {
    const now = new Date();
    const todo: Todo = {
      id: String(this.nextId++),
      title: input.title,
      description: input.description,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };
    this.todos.set(todo.id, todo);
    return todo;
  }

  async update(id: string, input: UpdateTodoInput): Promise<Todo> {
    const todo = this.todos.get(id);
    if (!todo) {
      throw new Error('Todo not found');
    }

    const updated: Todo = {
      ...todo,
      title: input.title !== undefined ? input.title : todo.title,
      description: input.description !== undefined ? input.description : todo.description,
      completed: input.completed !== undefined ? input.completed : todo.completed,
      updatedAt: new Date(),
    };

    this.todos.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.todos.delete(id);
  }
}
