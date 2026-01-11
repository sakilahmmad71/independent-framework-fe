import React from 'react';
import { useTodoUseCase } from './useTodoUseCase';

/**
 * React Component using the framework-independent business logic
 * Notice: All business logic is in the core layer, this component only handles UI
 */
export function TodoApp() {
  const { todos, loading, error, createTodo, toggleTodo, deleteTodo, completedCount, pendingCount } = useTodoUseCase();
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTodo(title, description);
      setTitle('');
      setDescription('');
    } catch (err) {
      // Error is already handled by the hook
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="todo-app">
      <h1>Todo App - React</h1>
      
      <div className="stats">
        <span>Pending: {pendingCount}</span>
        <span>Completed: {completedCount}</span>
      </div>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <button type="submit">Add Todo</button>
      </form>

      <ul className="todo-list">
        {todos.map(todo => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <div>
              <h3>{todo.title}</h3>
              <p>{todo.description}</p>
            </div>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
