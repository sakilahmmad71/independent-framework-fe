import { Todo, CreateTodoInput, UpdateTodoInput } from '../entities/Todo';
import { TodoRepository } from '../ports/TodoRepository';
import { SimpleObservable, Observer } from '../ports/Observable';

/**
 * Todo Management Use Case
 * This contains the core business logic for managing todos
 * It is completely framework-independent
 */
export class TodoUseCase {
  private todosObservable = new SimpleObservable<Todo[]>();
  private todos: Todo[] = [];

  constructor(private repository: TodoRepository) {}

  /**
   * Subscribe to todo list changes
   */
  subscribeTodos(observer: Observer<Todo[]>): () => void {
    return this.todosObservable.subscribe(observer);
  }

  /**
   * Load all todos
   */
  async loadTodos(): Promise<void> {
    this.todos = await this.repository.getAll();
    this.todosObservable.notify(this.todos);
  }

  /**
   * Create a new todo
   */
  async createTodo(input: CreateTodoInput): Promise<Todo> {
    // Business rule: Title must not be empty
    if (!input.title.trim()) {
      throw new Error('Todo title cannot be empty');
    }

    // Business rule: Title must be at least 3 characters
    if (input.title.trim().length < 3) {
      throw new Error('Todo title must be at least 3 characters');
    }

    const todo = await this.repository.create(input);
    this.todos.push(todo);
    this.todosObservable.notify(this.todos);
    return todo;
  }

  /**
   * Update a todo
   */
  async updateTodo(id: string, input: UpdateTodoInput): Promise<Todo> {
    // Business rule: If updating title, it must not be empty
    if (input.title !== undefined && !input.title.trim()) {
      throw new Error('Todo title cannot be empty');
    }

    // Business rule: If updating title, it must be at least 3 characters
    if (input.title !== undefined && input.title.trim().length < 3) {
      throw new Error('Todo title must be at least 3 characters');
    }

    const todo = await this.repository.update(id, input);
    const index = this.todos.findIndex(t => t.id === id);
    if (index !== -1) {
      this.todos[index] = todo;
      this.todosObservable.notify(this.todos);
    }
    return todo;
  }

  /**
   * Toggle todo completion status
   */
  async toggleTodo(id: string): Promise<Todo> {
    const todo = this.todos.find(t => t.id === id);
    if (!todo) {
      throw new Error('Todo not found');
    }

    return this.updateTodo(id, { completed: !todo.completed });
  }

  /**
   * Delete a todo
   */
  async deleteTodo(id: string): Promise<void> {
    await this.repository.delete(id);
    this.todos = this.todos.filter(t => t.id !== id);
    this.todosObservable.notify(this.todos);
  }

  /**
   * Get completed todos count (business logic)
   */
  getCompletedCount(): number {
    return this.todos.filter(t => t.completed).length;
  }

  /**
   * Get pending todos count (business logic)
   */
  getPendingCount(): number {
    return this.todos.filter(t => !t.completed).length;
  }

  /**
   * Get current todos snapshot
   */
  getTodos(): Todo[] {
    return [...this.todos];
  }
}
