/**
 * Vanilla JavaScript integration with framework-independent business logic
 * This example shows how to use the same business logic without any framework
 */

import { TodoUseCase } from '../../src/core/usecases/TodoUseCase';
import { InMemoryTodoRepository } from '../../src/adapters/InMemoryTodoRepository';

class TodoAppVanilla {
  private todoUseCase: TodoUseCase;
  private container: HTMLElement;

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container ${containerId} not found`);
    }
    this.container = container;

    // Initialize the use case with a repository adapter
    this.todoUseCase = new TodoUseCase(new InMemoryTodoRepository());

    // Subscribe to todo changes
    this.todoUseCase.subscribeTodos(() => {
      this.render();
    });

    // Initial render
    this.render();

    // Load todos
    this.todoUseCase.loadTodos();
  }

  private render(): void {
    const todos = this.todoUseCase.getTodos();
    const completedCount = this.todoUseCase.getCompletedCount();
    const pendingCount = this.todoUseCase.getPendingCount();

    this.container.innerHTML = `
      <div class="todo-app">
        <h1>Todo App - Vanilla JS</h1>
        
        <div class="stats">
          <span>Pending: ${pendingCount}</span>
          <span>Completed: ${completedCount}</span>
        </div>

        <form id="todo-form">
          <input
            id="title-input"
            type="text"
            placeholder="Title"
            required
          />
          <input
            id="description-input"
            type="text"
            placeholder="Description"
          />
          <button type="submit">Add Todo</button>
        </form>

        <div id="error" class="error" style="display: none;"></div>

        <ul class="todo-list">
          ${todos
            .map(
              todo => `
            <li class="${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
              <input
                type="checkbox"
                ${todo.completed ? 'checked' : ''}
                data-action="toggle"
              />
              <div>
                <h3>${this.escapeHtml(todo.title)}</h3>
                <p>${this.escapeHtml(todo.description)}</p>
              </div>
              <button data-action="delete">Delete</button>
            </li>
          `
            )
            .join('')}
        </ul>
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    // Form submission
    const form = document.getElementById('todo-form') as HTMLFormElement;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const titleInput = document.getElementById('title-input') as HTMLInputElement;
      const descInput = document.getElementById('description-input') as HTMLInputElement;

      try {
        await this.todoUseCase.createTodo({
          title: titleInput.value,
          description: descInput.value,
        });
        titleInput.value = '';
        descInput.value = '';
        this.hideError();
      } catch (err: any) {
        this.showError(err.message);
      }
    });

    // Todo actions
    const todoList = this.container.querySelector('.todo-list');
    todoList?.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement;
      const li = target.closest('li');
      if (!li) return;

      const todoId = li.dataset.id;
      if (!todoId) return;

      try {
        if (target.dataset.action === 'delete') {
          await this.todoUseCase.deleteTodo(todoId);
        } else if (target.dataset.action === 'toggle') {
          await this.todoUseCase.toggleTodo(todoId);
        }
        this.hideError();
      } catch (err: any) {
        this.showError(err.message);
      }
    });
  }

  private showError(message: string): void {
    const errorDiv = document.getElementById('error');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
    }
  }

  private hideError(): void {
    const errorDiv = document.getElementById('error');
    if (errorDiv) {
      errorDiv.style.display = 'none';
    }
  }

  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (char) => map[char]);
  }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  new TodoAppVanilla('app');
});
