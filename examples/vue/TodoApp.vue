<template>
  <div class="todo-app">
    <h1>Todo App - Vue</h1>
    
    <div class="stats">
      <span>Pending: {{ pendingCount }}</span>
      <span>Completed: {{ completedCount }}</span>
    </div>

    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="loading">Loading...</div>

    <form @submit.prevent="handleSubmit">
      <input
        v-model="title"
        type="text"
        placeholder="Title"
      />
      <input
        v-model="description"
        type="text"
        placeholder="Description"
      />
      <button type="submit">Add Todo</button>
    </form>

    <ul class="todo-list">
      <li
        v-for="todo in todos"
        :key="todo.id"
        :class="{ completed: todo.completed }"
      >
        <input
          type="checkbox"
          :checked="todo.completed"
          @change="toggleTodo(todo.id)"
        />
        <div>
          <h3>{{ todo.title }}</h3>
          <p>{{ todo.description }}</p>
        </div>
        <button @click="deleteTodo(todo.id)">Delete</button>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
import { TodoUseCase } from '../../src/core/usecases/TodoUseCase';
import { InMemoryTodoRepository } from '../../src/adapters/InMemoryTodoRepository';
import type { Todo } from '../../src/core/entities/Todo';

/**
 * Vue Component using the framework-independent business logic
 * Notice: All business logic is in the core layer, this component only handles UI
 */
export default defineComponent({
  name: 'TodoApp',
  setup() {
    // Initialize the use case with a repository adapter
    const todoUseCase = new TodoUseCase(new InMemoryTodoRepository());
    
    const todos = ref<Todo[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const title = ref('');
    const description = ref('');
    const completedCount = ref(0);
    const pendingCount = ref(0);

    let unsubscribe: (() => void) | null = null;

    onMounted(() => {
      // Subscribe to todo changes from the business logic
      unsubscribe = todoUseCase.subscribeTodos((newTodos) => {
        todos.value = newTodos;
        completedCount.value = todoUseCase.getCompletedCount();
        pendingCount.value = todoUseCase.getPendingCount();
      });

      // Load initial todos
      loading.value = true;
      todoUseCase
        .loadTodos()
        .catch(err => error.value = err.message)
        .finally(() => loading.value = false);
    });

    onUnmounted(() => {
      // Cleanup subscription
      if (unsubscribe) {
        unsubscribe();
      }
    });

    const handleSubmit = async () => {
      error.value = null;
      try {
        await todoUseCase.createTodo({
          title: title.value,
          description: description.value,
        });
        title.value = '';
        description.value = '';
      } catch (err: any) {
        error.value = err.message;
      }
    };

    const toggleTodo = async (id: string) => {
      error.value = null;
      try {
        await todoUseCase.toggleTodo(id);
      } catch (err: any) {
        error.value = err.message;
      }
    };

    const deleteTodo = async (id: string) => {
      error.value = null;
      try {
        await todoUseCase.deleteTodo(id);
      } catch (err: any) {
        error.value = err.message;
      }
    };

    return {
      todos,
      loading,
      error,
      title,
      description,
      completedCount,
      pendingCount,
      handleSubmit,
      toggleTodo,
      deleteTodo,
    };
  },
});
</script>
