import { Todo, CreateTodoInput, UpdateTodoInput } from '../core/entities/Todo';
import { TodoRepository } from '../core/ports/TodoRepository';

/**
 * LocalStorage implementation of TodoRepository
 * This adapter works in browser environments with any framework
 */
export class LocalStorageTodoRepository implements TodoRepository {
  private readonly STORAGE_KEY = 'todos';
  private nextId: number;

  constructor() {
    const todos = this.loadFromStorage();
    // Find the highest numeric ID, defaulting to 0 if none exist or all are non-numeric
    const numericIds = todos
      .map(t => parseInt(t.id, 10))
      .filter(id => !isNaN(id));
    this.nextId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;
  }

  private loadFromStorage(): Todo[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return [];
    
    const todos = JSON.parse(data) as Array<{
      id: string;
      title: string;
      description: string;
      completed: boolean;
      createdAt: string;
      updatedAt: string;
    }>;
    // Convert date strings back to Date objects
    return todos.map((t) => ({
      ...t,
      createdAt: new Date(t.createdAt),
      updatedAt: new Date(t.updatedAt),
    }));
  }

  private saveToStorage(todos: Todo[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(todos));
  }

  async getAll(): Promise<Todo[]> {
    return this.loadFromStorage();
  }

  async getById(id: string): Promise<Todo | null> {
    const todos = this.loadFromStorage();
    return todos.find(t => t.id === id) || null;
  }

  async create(input: CreateTodoInput): Promise<Todo> {
    const todos = this.loadFromStorage();
    const now = new Date();
    
    const todo: Todo = {
      id: String(this.nextId++),
      title: input.title,
      description: input.description,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    todos.push(todo);
    this.saveToStorage(todos);
    return todo;
  }

  async update(id: string, input: UpdateTodoInput): Promise<Todo> {
    const todos = this.loadFromStorage();
    const index = todos.findIndex(t => t.id === id);
    
    if (index === -1) {
      throw new Error('Todo not found');
    }

    const todo = todos[index];
    const updated: Todo = {
      ...todo,
      title: input.title !== undefined ? input.title : todo.title,
      description: input.description !== undefined ? input.description : todo.description,
      completed: input.completed !== undefined ? input.completed : todo.completed,
      updatedAt: new Date(),
    };

    todos[index] = updated;
    this.saveToStorage(todos);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const todos = this.loadFromStorage();
    const filtered = todos.filter(t => t.id !== id);
    this.saveToStorage(filtered);
  }
}
