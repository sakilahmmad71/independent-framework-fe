/**
 * Core domain entity representing a Todo item
 * This is pure business logic with no framework dependencies
 */
export interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Todo creation input
 */
export interface CreateTodoInput {
  title: string;
  description: string;
}

/**
 * Todo update input
 */
export interface UpdateTodoInput {
  title?: string;
  description?: string;
  completed?: boolean;
}
