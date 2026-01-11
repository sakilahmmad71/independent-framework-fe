/**
 * TodoService - Framework-agnostic business logic service
 * Contains all business operations for managing todos
 */
import { Todo } from '../models/Todo.js';

export class TodoService {
  constructor(store) {
    this.store = store;
  }

  /**
   * Add a new todo
   * @param {string} title - The title of the todo
   * @returns {Todo} The created todo
   */
  addTodo(title) {
    if (!title || title.trim() === '') {
      throw new Error('Todo title cannot be empty');
    }

    const id = this.generateId();
    const todo = new Todo(id, title.trim());
    
    const todos = [...this.store.getState().todos, todo];
    this.store.setState({ todos });
    
    return todo;
  }

  /**
   * Toggle a todo's completion status
   * @param {string} id - The id of the todo to toggle
   */
  toggleTodo(id) {
    const todos = this.store.getState().todos.map(todo =>
      todo.id === id ? todo.toggle() : todo
    );
    this.store.setState({ todos });
  }

  /**
   * Delete a todo
   * @param {string} id - The id of the todo to delete
   */
  deleteTodo(id) {
    const todos = this.store.getState().todos.filter(todo => todo.id !== id);
    this.store.setState({ todos });
  }

  /**
   * Update a todo's title
   * @param {string} id - The id of the todo to update
   * @param {string} newTitle - The new title
   */
  updateTodo(id, newTitle) {
    const todos = this.store.getState().todos.map(todo =>
      todo.id === id ? todo.updateTitle(newTitle) : todo
    );
    this.store.setState({ todos });
  }

  /**
   * Get all todos
   * @returns {Todo[]} Array of all todos
   */
  getAllTodos() {
    return this.store.getState().todos;
  }

  /**
   * Get active (incomplete) todos
   * @returns {Todo[]} Array of active todos
   */
  getActiveTodos() {
    return this.store.getState().todos.filter(todo => !todo.completed);
  }

  /**
   * Get completed todos
   * @returns {Todo[]} Array of completed todos
   */
  getCompletedTodos() {
    return this.store.getState().todos.filter(todo => todo.completed);
  }

  /**
   * Clear all completed todos
   */
  clearCompleted() {
    const todos = this.store.getState().todos.filter(todo => !todo.completed);
    this.store.setState({ todos });
  }

  /**
   * Generate a unique ID for a new todo
   * @returns {string} Unique ID
   */
  generateId() {
    return `todo_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Get statistics about todos
   * @returns {Object} Statistics object
   */
  getStats() {
    const todos = this.getAllTodos();
    return {
      total: todos.length,
      active: this.getActiveTodos().length,
      completed: this.getCompletedTodos().length
    };
  }
}
