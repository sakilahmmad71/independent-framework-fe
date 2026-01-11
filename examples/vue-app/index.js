import { createApp } from 'vue';
import TodoApp from './TodoApp.vue';
import { Store, TodoService } from '../../src/core';

// Initialize the framework-agnostic store
const store = new Store({
  todos: []
});

// Initialize the framework-agnostic service
const todoService = new TodoService(store);

// Create and mount the Vue app
const app = createApp(TodoApp, {
  store,
  todoService
});

app.mount('#app');
