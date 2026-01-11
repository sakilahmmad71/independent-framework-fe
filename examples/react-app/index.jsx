import React from 'react';
import { createRoot } from 'react-dom/client';
import { TodoApp } from './TodoApp';
import { Store, TodoService } from '../../src/core';

// Initialize the framework-agnostic store
const store = new Store({
  todos: []
});

// Initialize the framework-agnostic service
const todoService = new TodoService(store);

// Render the React app
const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <TodoApp store={store} todoService={todoService} />
  </React.StrictMode>
);
