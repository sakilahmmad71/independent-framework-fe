import React, { useState } from 'react';
import { useStore } from '../../adapters/react';

/**
 * React Todo App Component
 * Demonstrates how to use the framework-agnostic business logic with React
 */
export function TodoApp({ store, todoService }) {
  const state = useStore(store);
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, completed

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      try {
        todoService.addTodo(inputValue);
        setInputValue('');
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const getFilteredTodos = () => {
    switch (filter) {
      case 'active':
        return todoService.getActiveTodos();
      case 'completed':
        return todoService.getCompletedTodos();
      default:
        return todoService.getAllTodos();
    }
  };

  const stats = todoService.getStats();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Todo App - React</h1>
      
      <form onSubmit={handleAddTodo} style={styles.form}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="What needs to be done?"
          style={styles.input}
        />
        <button type="submit" style={styles.addButton}>
          Add
        </button>
      </form>

      <div style={styles.filters}>
        <button
          onClick={() => setFilter('all')}
          style={{
            ...styles.filterButton,
            ...(filter === 'all' ? styles.filterButtonActive : {})
          }}
        >
          All ({stats.total})
        </button>
        <button
          onClick={() => setFilter('active')}
          style={{
            ...styles.filterButton,
            ...(filter === 'active' ? styles.filterButtonActive : {})
          }}
        >
          Active ({stats.active})
        </button>
        <button
          onClick={() => setFilter('completed')}
          style={{
            ...styles.filterButton,
            ...(filter === 'completed' ? styles.filterButtonActive : {})
          }}
        >
          Completed ({stats.completed})
        </button>
      </div>

      <ul style={styles.todoList}>
        {getFilteredTodos().map((todo) => (
          <li key={todo.id} style={styles.todoItem}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => todoService.toggleTodo(todo.id)}
              style={styles.checkbox}
            />
            <span
              style={{
                ...styles.todoText,
                ...(todo.completed ? styles.todoTextCompleted : {})
              }}
            >
              {todo.title}
            </span>
            <button
              onClick={() => todoService.deleteTodo(todo.id)}
              style={styles.deleteButton}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {stats.completed > 0 && (
        <button
          onClick={() => todoService.clearCompleted()}
          style={styles.clearButton}
        >
          Clear Completed
        </button>
      )}

      <div style={styles.info}>
        <p>Framework: <strong>React</strong></p>
        <p>Business Logic: <strong>Framework-Agnostic</strong></p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  title: {
    textAlign: 'center',
    color: '#333'
  },
  form: {
    display: 'flex',
    marginBottom: '20px'
  },
  input: {
    flex: 1,
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '4px 0 0 4px'
  },
  addButton: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '0 4px 4px 0',
    cursor: 'pointer'
  },
  filters: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px'
  },
  filterButton: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
    color: 'white',
    borderColor: '#2196F3'
  },
  todoList: {
    listStyle: 'none',
    padding: 0
  },
  todoItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: '#f9f9f9',
    marginBottom: '8px',
    borderRadius: '4px'
  },
  checkbox: {
    marginRight: '10px',
    width: '20px',
    height: '20px',
    cursor: 'pointer'
  },
  todoText: {
    flex: 1,
    fontSize: '16px'
  },
  todoTextCompleted: {
    textDecoration: 'line-through',
    color: '#999'
  },
  deleteButton: {
    padding: '5px 10px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  clearButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#ff9800',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '20px'
  },
  info: {
    marginTop: '30px',
    padding: '15px',
    backgroundColor: '#e3f2fd',
    borderRadius: '4px',
    textAlign: 'center'
  }
};
