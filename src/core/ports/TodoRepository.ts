import { Todo, CreateTodoInput, UpdateTodoInput } from '../entities/Todo';

/**
 * Repository interface for Todo persistence
 * This is a port that can be implemented by different adapters
 * (e.g., REST API, GraphQL, LocalStorage, IndexedDB)
 */
export interface TodoRepository {
  /**
   * Get all todos
   */
  getAll(): Promise<Todo[]>;

  /**
   * Get a todo by ID
   */
  getById(id: string): Promise<Todo | null>;

  /**
   * Create a new todo
   */
  create(input: CreateTodoInput): Promise<Todo>;

  /**
   * Update an existing todo
   */
  update(id: string, input: UpdateTodoInput): Promise<Todo>;

  /**
   * Delete a todo
   */
  delete(id: string): Promise<void>;
}
