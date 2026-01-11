# Framework Comparison - React vs Vue (Same Business Logic)

This document demonstrates how the **exact same business logic** is used in both React and Vue implementations.

## Side-by-Side Comparison

### Initialization (Identical!)

Both frameworks use the same initialization:

```javascript
// Same for React and Vue!
import { Store, TodoService } from './src/core';

const store = new Store({ todos: [] });
const todoService = new TodoService(store);
```

### State Management

**React:**
```javascript
import { useStore } from './src/adapters/react';

function TodoApp({ store, todoService }) {
  const state = useStore(store);
  // state.todos is available
}
```

**Vue:**
```javascript
import { useStore } from './src/adapters/vue';

const state = useStore(store);
// state.value.todos is available
```

### Operations (Identical!)

Both use the same service methods:

```javascript
// React
todoService.addTodo('New task');
todoService.toggleTodo(todoId);
todoService.deleteTodo(todoId);
const stats = todoService.getStats();

// Vue
todoService.addTodo('New task');
todoService.toggleTodo(todoId);
todoService.deleteTodo(todoId);
const stats = todoService.getStats();
```

### Event Handling

The business logic call is identical; only the event syntax differs:

**React:**
```jsx
<button onClick={() => todoService.addTodo(inputValue)}>
  Add
</button>
```

**Vue:**
```vue
<button @click="todoService.addTodo(inputValue)">
  Add
</button>
```

### Complete Feature: Toggle Todo

**React Implementation:**
```jsx
function TodoItem({ todo, todoService }) {
  return (
    <input
      type="checkbox"
      checked={todo.completed}
      onChange={() => todoService.toggleTodo(todo.id)}
    />
  );
}
```

**Vue Implementation:**
```vue
<template>
  <input
    type="checkbox"
    :checked="todo.completed"
    @change="todoService.toggleTodo(todo.id)"
  />
</template>
```

**Business Logic (Used by Both):**
```javascript
// src/core/services/TodoService.js
toggleTodo(id) {
  const todos = this.store.getState().todos.map(todo =>
    todo.id === id ? todo.toggle() : todo
  );
  this.store.setState({ todos });
}

// src/core/models/Todo.js
toggle() {
  return new Todo(this.id, this.title, !this.completed, this.createdAt);
}
```

## What Changes When Switching Frameworks?

### ✅ Stays the Same (No Changes Needed)

1. **All of `src/core/`**
   - Models (Todo.js)
   - Services (TodoService.js)
   - Store (Store.js)

2. **Business Operations**
   - addTodo()
   - toggleTodo()
   - deleteTodo()
   - getStats()
   - All validation logic
   - All state transformations

3. **Data Flow**
   - How state is updated
   - How operations are executed
   - Immutability patterns

### ❌ Must Change (Framework-Specific)

1. **Adapter Import**
   ```javascript
   // From
   import { useStore } from './adapters/react';
   // To
   import { useStore } from './adapters/vue';
   ```

2. **Component Syntax**
   - JSX → Vue templates
   - `onClick` → `@click`
   - `onChange` → `@change`
   - `className` → `class`

3. **State Access**
   - React: `state.todos`
   - Vue: `state.value.todos`

## Adding a New Feature

Let's add "Edit Todo" feature:

### Step 1: Update Model (Framework-Agnostic)
```javascript
// src/core/models/Todo.js
updateTitle(newTitle) {
  if (!newTitle || newTitle.trim() === '') {
    throw new Error('Title cannot be empty');
  }
  return new Todo(this.id, newTitle.trim(), this.completed, this.createdAt);
}
```

### Step 2: Update Service (Framework-Agnostic)
```javascript
// src/core/services/TodoService.js
updateTodo(id, newTitle) {
  const todos = this.store.getState().todos.map(todo =>
    todo.id === id ? todo.updateTitle(newTitle) : todo
  );
  this.store.setState({ todos });
}
```

### Step 3a: Use in React (Framework-Specific)
```jsx
function EditTodo({ todo, todoService }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(todo.title);

  const handleSave = () => {
    todoService.updateTodo(todo.id, text);
    setEditing(false);
  };

  return editing ? (
    <input value={text} onChange={e => setText(e.target.value)} />
    <button onClick={handleSave}>Save</button>
  ) : (
    <span onClick={() => setEditing(true)}>{todo.title}</span>
  );
}
```

### Step 3b: Use in Vue (Framework-Specific)
```vue
<template>
  <input v-if="editing" v-model="text" />
  <button v-if="editing" @click="handleSave">Save</button>
  <span v-else @click="editing = true">{{ todo.title }}</span>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps(['todo', 'todoService']);
const editing = ref(false);
const text = ref(props.todo.title);

const handleSave = () => {
  props.todoService.updateTodo(props.todo.id, text.value);
  editing.value = false;
};
</script>
```

**Notice:** Steps 1 and 2 (the business logic) are written **once** and work in both React and Vue!

## Testing Comparison

### Unit Tests (Framework-Agnostic)

These tests work without any framework:

```javascript
import { Store } from './src/core/store/Store.js';
import { TodoService } from './src/core/services/TodoService.js';
import { Todo } from './src/core/models/Todo.js';

describe('TodoService', () => {
  let store;
  let service;

  beforeEach(() => {
    store = new Store({ todos: [] });
    service = new TodoService(store);
  });

  test('adds a todo', () => {
    service.addTodo('Test task');
    expect(store.getState().todos).toHaveLength(1);
    expect(store.getState().todos[0].title).toBe('Test task');
  });

  test('toggles a todo', () => {
    const todo = service.addTodo('Test task');
    service.toggleTodo(todo.id);
    expect(store.getState().todos[0].completed).toBe(true);
  });
});
```

### Integration Tests (Framework-Specific)

**React Testing:**
```javascript
import { render, fireEvent } from '@testing-library/react';
import { TodoApp } from './TodoApp';

test('React: adds a todo', () => {
  const { getByPlaceholderText, getByText } = render(<TodoApp {...props} />);
  const input = getByPlaceholderText('What needs to be done?');
  fireEvent.change(input, { target: { value: 'New task' } });
  fireEvent.submit(input.form);
  expect(getByText('New task')).toBeInTheDocument();
});
```

**Vue Testing:**
```javascript
import { mount } from '@vue/test-utils';
import TodoApp from './TodoApp.vue';

test('Vue: adds a todo', async () => {
  const wrapper = mount(TodoApp, { props });
  const input = wrapper.find('input[type="text"]');
  await input.setValue('New task');
  await wrapper.find('form').trigger('submit');
  expect(wrapper.text()).toContain('New task');
});
```

**Both tests validate the same behavior, just with different testing utilities!**

## Performance Comparison

Both implementations have similar performance characteristics because:

1. **Same State Updates**: Both use the same store with the same update mechanism
2. **Same Business Logic**: Identical computational complexity
3. **Same Data Structures**: Using the same models and data flow

The only performance differences would be framework-specific (React's reconciliation vs Vue's reactivity system), which is independent of our business logic.

## Conclusion

This architecture provides:

- ✅ **100% Business Logic Reuse** between frameworks
- ✅ **Consistent Behavior** across different UIs
- ✅ **Easy Testing** of core logic without frameworks
- ✅ **Framework Independence** - not locked in
- ✅ **Clear Separation** - UI is truly independent from logic
- ✅ **Maintainability** - changes in one place affect both UIs
- ✅ **Team Efficiency** - logic and UI teams can work independently

When you switch from React to Vue (or add Angular, Svelte, etc.):
- Business logic: **0 changes** ✅
- Adapter: **1 import change** ✅
- UI: **Rewrite in new framework** (unavoidable) ✅

The key insight: **Business logic is written once and works everywhere!**
