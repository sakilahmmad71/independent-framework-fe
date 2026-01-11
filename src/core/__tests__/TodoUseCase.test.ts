import { TodoUseCase } from '../usecases/TodoUseCase';
import { InMemoryTodoRepository } from '../../adapters/InMemoryTodoRepository';

describe('TodoUseCase', () => {
  let todoUseCase: TodoUseCase;
  let repository: InMemoryTodoRepository;

  beforeEach(() => {
    repository = new InMemoryTodoRepository();
    todoUseCase = new TodoUseCase(repository);
  });

  describe('createTodo', () => {
    it('should create a todo with valid input', async () => {
      const input = { title: 'Test Todo', description: 'Test Description' };
      const todo = await todoUseCase.createTodo(input);

      expect(todo.title).toBe(input.title);
      expect(todo.description).toBe(input.description);
      expect(todo.completed).toBe(false);
      expect(todo.id).toBeDefined();
    });

    it('should reject empty title', async () => {
      const input = { title: '', description: 'Test' };
      await expect(todoUseCase.createTodo(input)).rejects.toThrow('Todo title cannot be empty');
    });

    it('should reject title with less than 3 characters', async () => {
      const input = { title: 'ab', description: 'Test' };
      await expect(todoUseCase.createTodo(input)).rejects.toThrow('Todo title must be at least 3 characters');
    });

    it('should notify subscribers when todo is created', async () => {
      const observer = jest.fn();
      todoUseCase.subscribeTodos(observer);

      await todoUseCase.loadTodos();
      expect(observer).toHaveBeenCalledTimes(1);

      await todoUseCase.createTodo({ title: 'Test', description: 'Test' });
      expect(observer).toHaveBeenCalledTimes(2);
      expect(observer).toHaveBeenLastCalledWith(expect.arrayContaining([
        expect.objectContaining({ title: 'Test' })
      ]));
    });
  });

  describe('updateTodo', () => {
    it('should update todo properties', async () => {
      const created = await todoUseCase.createTodo({ title: 'Original', description: 'Original Desc' });
      const updated = await todoUseCase.updateTodo(created.id, { title: 'Updated' });

      expect(updated.title).toBe('Updated');
      expect(updated.description).toBe('Original Desc');
    });

    it('should reject empty title on update', async () => {
      const created = await todoUseCase.createTodo({ title: 'Original', description: 'Test' });
      await expect(todoUseCase.updateTodo(created.id, { title: '' })).rejects.toThrow('Todo title cannot be empty');
    });
  });

  describe('toggleTodo', () => {
    it('should toggle completion status', async () => {
      const todo = await todoUseCase.createTodo({ title: 'Test', description: 'Test' });
      expect(todo.completed).toBe(false);

      const toggled = await todoUseCase.toggleTodo(todo.id);
      expect(toggled.completed).toBe(true);

      const toggledAgain = await todoUseCase.toggleTodo(todo.id);
      expect(toggledAgain.completed).toBe(false);
    });

    it('should throw error for non-existent todo', async () => {
      await expect(todoUseCase.toggleTodo('non-existent')).rejects.toThrow('Todo not found');
    });
  });

  describe('deleteTodo', () => {
    it('should delete a todo', async () => {
      const todo = await todoUseCase.createTodo({ title: 'Test', description: 'Test' });
      await todoUseCase.loadTodos();
      
      expect(todoUseCase.getTodos()).toHaveLength(1);

      await todoUseCase.deleteTodo(todo.id);
      expect(todoUseCase.getTodos()).toHaveLength(0);
    });
  });

  describe('getCompletedCount and getPendingCount', () => {
    it('should return correct counts', async () => {
      await todoUseCase.createTodo({ title: 'Todo 1', description: 'Test' });
      await todoUseCase.createTodo({ title: 'Todo 2', description: 'Test' });
      await todoUseCase.createTodo({ title: 'Todo 3', description: 'Test' });
      await todoUseCase.loadTodos();

      expect(todoUseCase.getPendingCount()).toBe(3);
      expect(todoUseCase.getCompletedCount()).toBe(0);

      const todos = todoUseCase.getTodos();
      await todoUseCase.toggleTodo(todos[0].id);
      await todoUseCase.toggleTodo(todos[1].id);

      expect(todoUseCase.getPendingCount()).toBe(1);
      expect(todoUseCase.getCompletedCount()).toBe(2);
    });
  });
});
