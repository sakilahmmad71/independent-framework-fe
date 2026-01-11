# Framework-Independent Frontend Architecture

A demonstration of building frontend applications where **business logic is completely separated from UI frameworks**. Start with React, switch to Vue later - **without changing a single line of business logic!**

## 🚀 Quick Start

This project shows how to build apps where the business logic is framework-agnostic and the UI can be implemented in React, Vue, or any other framework.

### What's Inside

- **Framework-Agnostic Core** (`src/core/`): Pure JavaScript business logic
  - Models: Todo entities with immutable operations
  - Services: TodoService with all business operations
  - Store: Observable state management

- **Framework Adapters** (`src/adapters/`):
  - React: `useStore` hook
  - Vue: `useStore` composable

- **Example Apps** (`examples/`):
  - React Todo App
  - Vue Todo App
  - **Both use identical business logic!**

## 🎯 Key Features

✅ **Zero Business Logic Changes** when switching frameworks  
✅ **Same Store, Services, and Models** work in React and Vue  
✅ **Easy Testing** - test business logic without framework dependencies  
✅ **Clear Separation** - UI layer is truly independent from logic  
✅ **Framework Agnostic** - add Angular, Svelte, Solid by creating simple adapters

## 📖 Documentation

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation including:
- Architecture overview and principles
- Complete usage examples
- How to switch between frameworks
- Testing strategies
- Extension guidelines

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│     UI Layer (React / Vue / Others)        │
└─────────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────────┐
│     Adapter Layer (Framework Bridge)       │
└─────────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────────┐
│  Core Layer (Framework-Agnostic JS)        │
│     Models → Services → Store              │
└─────────────────────────────────────────────┘
```

## 💡 Example Usage

### React Example
```javascript
import { Store, TodoService } from './src/core';
import { useStore } from './src/adapters/react';

const store = new Store({ todos: [] });
const todoService = new TodoService(store);

function TodoApp() {
  const state = useStore(store);
  return <div>{/* Use state.todos */}</div>;
}
```

### Vue Example
```vue
<script setup>
import { Store, TodoService } from './src/core';
import { useStore } from './src/adapters/vue';

const store = new Store({ todos: [] });
const todoService = new TodoService(store);
const state = useStore(store);
</script>
```

**Notice**: Same `Store` and `TodoService` in both! 🎉

## 🔄 Switching Frameworks

1. Keep `src/core/` unchanged ✅
2. Change adapter import (`react` → `vue`)
3. Rewrite UI components in new framework
4. Done! Business logic stays identical

## 📁 Project Structure

```
src/
├── core/              # Framework-agnostic (THE IMPORTANT PART!)
│   ├── models/        # Business entities
│   ├── services/      # Business logic
│   └── store/         # State management
├── adapters/          # Framework bridges
│   ├── react/         # React hooks
│   └── vue/           # Vue composables
└── examples/          # Live examples
    ├── react-app/     # Todo app in React
    └── vue-app/       # Todo app in Vue
```

## 🧪 Testing

Test business logic independently:

```javascript
import { TodoService } from './src/core';
import { Store } from './src/core';

const store = new Store({ todos: [] });
const service = new TodoService(store);

service.addTodo('Test');
expect(store.getState().todos).toHaveLength(1);
// No React or Vue needed! ✅
```

## 🌟 Benefits

- **Framework Independence**: Not locked into any framework
- **Easier Testing**: Test logic without UI complexity
- **Better Maintainability**: Clear separation of concerns
- **Team Efficiency**: UI and logic teams work independently
- **Future-Proof**: Adopt new frameworks without rewriting logic

## 📚 Learn More

Check out [ARCHITECTURE.md](./ARCHITECTURE.md) for:
- Detailed architecture explanation
- Complete code examples
- Best practices
- How to extend the system

## 📄 License

MIT