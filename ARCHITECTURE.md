# Architecture Overview

## Core Principles

This project demonstrates a **framework-independent frontend architecture** based on the following principles:

### 1. Separation of Concerns

- **Business Logic Layer**: Contains all domain logic, business rules, and state management
- **Adapter Layer**: Provides concrete implementations of interfaces (repositories)
- **UI Layer**: Framework-specific code that renders the UI and handles user interactions

### 2. Dependency Inversion

```
UI Layer → Depends on → Core Business Logic
                ↑
                └─── Depends on ← Adapters
```

The business logic layer defines interfaces (ports) that adapters implement. The UI layer uses the business logic but never directly depends on specific adapters.

### 3. Observable Pattern

State changes in the business logic are communicated to the UI layer through the Observer pattern:

```typescript
// Business logic notifies subscribers
todoUseCase.subscribeTodos((todos) => {
  // UI layer receives updates
  updateUI(todos);
});
```

## Layer Details

### Core Business Logic Layer (`src/core/`)

This layer is **completely framework-independent**. It contains:

#### Entities
Pure data structures representing domain concepts:
- No framework dependencies
- No UI logic
- Just TypeScript interfaces

```typescript
export interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Use Cases
Business logic and workflows:
- Contains business rules
- Coordinates between entities and repositories
- Manages application state
- Notifies observers of state changes

```typescript
export class TodoUseCase {
  async createTodo(input: CreateTodoInput): Promise<Todo> {
    // Business rule: Title must not be empty
    if (!input.title.trim()) {
      throw new Error('Todo title cannot be empty');
    }
    
    const todo = await this.repository.create(input);
    this.notifySubscribers(this.todos);
    return todo;
  }
}
```

#### Ports (Interfaces)
Define contracts for external dependencies:
- Repository interfaces
- Observer interfaces
- Any external service interfaces

```typescript
export interface TodoRepository {
  getAll(): Promise<Todo[]>;
  create(input: CreateTodoInput): Promise<Todo>;
  update(id: string, input: UpdateTodoInput): Promise<Todo>;
  delete(id: string): Promise<void>;
}
```

### Adapter Layer (`src/adapters/`)

Provides concrete implementations of port interfaces:
- Can be swapped without changing business logic
- Examples: InMemory, LocalStorage, REST API, GraphQL

```typescript
export class InMemoryTodoRepository implements TodoRepository {
  private todos: Map<string, Todo> = new Map();
  
  async getAll(): Promise<Todo[]> {
    return Array.from(this.todos.values());
  }
  // ... other implementations
}
```

### UI Layer (`examples/`)

Framework-specific code that:
- Creates use case instances with appropriate adapters
- Subscribes to state changes
- Renders the UI
- Handles user interactions

Different frameworks can use the same business logic with minimal glue code:

**React:**
```typescript
function useTodoUseCase() {
  const [todoUseCase] = useState(() => new TodoUseCase(new InMemoryTodoRepository()));
  const [todos, setTodos] = useState([]);
  
  useEffect(() => {
    return todoUseCase.subscribeTodos(setTodos);
  }, []);
  
  return { todos, createTodo: todoUseCase.createTodo.bind(todoUseCase) };
}
```

**Vue:**
```typescript
const todoUseCase = new TodoUseCase(new InMemoryTodoRepository());
const todos = ref([]);

onMounted(() => {
  unsubscribe = todoUseCase.subscribeTodos((newTodos) => {
    todos.value = newTodos;
  });
});
```

## Benefits

### 1. Framework Flexibility
Switch from React to Vue to Svelte without changing business logic:
- Business rules remain consistent
- Testing stays the same
- Only UI bindings change

### 2. Testability
Test business logic without mounting components:
```typescript
test('should create todo with valid input', async () => {
  const useCase = new TodoUseCase(new InMemoryTodoRepository());
  const todo = await useCase.createTodo({ title: 'Test', description: 'Test' });
  expect(todo.title).toBe('Test');
});
```

### 3. Maintainability
- Clear boundaries between layers
- Easy to locate and modify business rules
- Changes to one layer don't affect others

### 4. Scalability
- Add new features by extending use cases
- Swap adapters (e.g., from InMemory to REST API)
- No framework lock-in

## Design Patterns Used

1. **Repository Pattern**: Abstracts data access
2. **Observer Pattern**: State change notifications
3. **Dependency Injection**: Use cases receive repositories
4. **Facade Pattern**: Use cases provide simple interface to complex logic

## Migration Path

To migrate an existing application to this architecture:

1. **Extract Entities**: Identify domain objects
2. **Define Ports**: Create repository interfaces
3. **Implement Use Cases**: Move business logic to use cases
4. **Create Adapters**: Implement repositories
5. **Update UI**: Connect framework to use cases via observers

This can be done incrementally, feature by feature.
