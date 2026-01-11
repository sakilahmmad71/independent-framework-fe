/**
 * Todo Model - Framework-agnostic business entity
 * This model represents a todo item with pure business logic
 */
export class Todo {
  constructor(id, title, completed = false, createdAt = new Date()) {
    this.id = id;
    this.title = title;
    this.completed = completed;
    this.createdAt = createdAt;
  }

  /**
   * Toggle the completion status of the todo
   * @returns {Todo} A new Todo instance with toggled status
   */
  toggle() {
    return new Todo(this.id, this.title, !this.completed, this.createdAt);
  }

  /**
   * Update the title of the todo
   * @param {string} newTitle - The new title
   * @returns {Todo} A new Todo instance with updated title
   */
  updateTitle(newTitle) {
    if (!newTitle || newTitle.trim() === '') {
      throw new Error('Title cannot be empty');
    }
    return new Todo(this.id, newTitle.trim(), this.completed, this.createdAt);
  }

  /**
   * Validate if the todo is valid
   * @returns {boolean} True if valid
   */
  isValid() {
    return this.title && this.title.trim().length > 0;
  }

  /**
   * Convert to plain object for serialization
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      completed: this.completed,
      createdAt: this.createdAt.toISOString()
    };
  }

  /**
   * Create Todo from plain object
   * @param {Object} obj - Plain object
   * @returns {Todo} Todo instance
   */
  static fromJSON(obj) {
    return new Todo(
      obj.id,
      obj.title,
      obj.completed,
      new Date(obj.createdAt)
    );
  }
}
