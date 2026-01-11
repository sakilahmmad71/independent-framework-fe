import { useState, useEffect } from 'react';
import { TodoUseCase } from '../../src/core/usecases/TodoUseCase';
import { InMemoryTodoRepository } from '../../src/adapters/InMemoryTodoRepository';

/**
 * React Hook that integrates with framework-independent TodoUseCase
 * This is the ONLY React-specific code needed to use the business logic
 */
export function useTodoUseCase() {
  // Initialize the use case with a repository adapter
  const [todoUseCase] = useState(() => new TodoUseCase(new InMemoryTodoRepository()));
  const [todos, setTodos] = useState(() => todoUseCase.getTodos());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to todo changes from the business logic
    const unsubscribe = todoUseCase.subscribeTodos(setTodos);

    // Load initial todos
    setLoading(true);
    todoUseCase
      .loadTodos()
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));

    // Cleanup subscription
    return unsubscribe;
  }, [todoUseCase]);

  const createTodo = async (title: string, description: string) => {
    setError(null);
    try {
      await todoUseCase.createTodo({ title, description });
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const toggleTodo = async (id: string) => {
    setError(null);
    try {
      await todoUseCase.toggleTodo(id);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteTodo = async (id: string) => {
    setError(null);
    try {
      await todoUseCase.deleteTodo(id);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    todos,
    loading,
    error,
    createTodo,
    toggleTodo,
    deleteTodo,
    completedCount: todoUseCase.getCompletedCount(),
    pendingCount: todoUseCase.getPendingCount(),
  };
}
