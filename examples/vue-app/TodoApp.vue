<template>
  <div class="container">
    <h1 class="title">Todo App - Vue</h1>
    
    <form @submit.prevent="handleAddTodo" class="form">
      <input
        v-model="inputValue"
        type="text"
        placeholder="What needs to be done?"
        class="input"
      />
      <button type="submit" class="add-button">
        Add
      </button>
    </form>

    <div class="filters">
      <button
        @click="filter = 'all'"
        :class="['filter-button', { active: filter === 'all' }]"
      >
        All ({{ stats.total }})
      </button>
      <button
        @click="filter = 'active'"
        :class="['filter-button', { active: filter === 'active' }]"
      >
        Active ({{ stats.active }})
      </button>
      <button
        @click="filter = 'completed'"
        :class="['filter-button', { active: filter === 'completed' }]"
      >
        Completed ({{ stats.completed }})
      </button>
    </div>

    <ul class="todo-list">
      <li v-for="todo in filteredTodos" :key="todo.id" class="todo-item">
        <input
          type="checkbox"
          :checked="todo.completed"
          @change="todoService.toggleTodo(todo.id)"
          class="checkbox"
        />
        <span
          :class="['todo-text', { completed: todo.completed }]"
        >
          {{ todo.title }}
        </span>
        <button
          @click="todoService.deleteTodo(todo.id)"
          class="delete-button"
        >
          Delete
        </button>
      </li>
    </ul>

    <button
      v-if="stats.completed > 0"
      @click="todoService.clearCompleted()"
      class="clear-button"
    >
      Clear Completed
    </button>

    <div class="info">
      <p>Framework: <strong>Vue</strong></p>
      <p>Business Logic: <strong>Framework-Agnostic</strong></p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from '../../src/adapters/vue';

const props = defineProps({
  store: Object,
  todoService: Object
});

const state = useStore(props.store);
const inputValue = ref('');
const filter = ref('all');

const handleAddTodo = () => {
  if (inputValue.value.trim()) {
    try {
      props.todoService.addTodo(inputValue.value);
      inputValue.value = '';
    } catch (error) {
      alert(error.message);
    }
  }
};

const filteredTodos = computed(() => {
  switch (filter.value) {
    case 'active':
      return props.todoService.getActiveTodos();
    case 'completed':
      return props.todoService.getCompletedTodos();
    default:
      return props.todoService.getAllTodos();
  }
});

const stats = computed(() => props.todoService.getStats());
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.title {
  text-align: center;
  color: #333;
}

.form {
  display: flex;
  margin-bottom: 20px;
}

.input {
  flex: 1;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
}

.add-button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.filter-button {
  flex: 1;
  padding: 8px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.filter-button.active {
  background-color: #2196F3;
  color: white;
  border-color: #2196F3;
}

.todo-list {
  list-style: none;
  padding: 0;
}

.todo-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #f9f9f9;
  margin-bottom: 8px;
  border-radius: 4px;
}

.checkbox {
  margin-right: 10px;
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.todo-text {
  flex: 1;
  font-size: 16px;
}

.todo-text.completed {
  text-decoration: line-through;
  color: #999;
}

.delete-button {
  padding: 5px 10px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.clear-button {
  width: 100%;
  padding: 10px;
  background-color: #ff9800;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 20px;
}

.info {
  margin-top: 30px;
  padding: 15px;
  background-color: #e3f2fd;
  border-radius: 4px;
  text-align: center;
}
</style>
