# Architecture Diagram

## Visual Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        YOUR APPLICATION                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    UI LAYER (Framework-Specific)                 │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    REACT     │  │     VUE      │  │   ANGULAR    │          │
│  │              │  │              │  │              │          │
│  │ • Components │  │ • Components │  │ • Components │          │
│  │ • Hooks      │  │ • Composables│  │ • Services   │          │
│  │ • Context    │  │ • Refs       │  │ • Observables│          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                  │
│         └──────────────────┼──────────────────┘                  │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             │ Uses (no coupling)
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│              CORE LAYER (Framework-Agnostic)                     │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                    USE CASES                            │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │ • Business Logic                                  │  │    │
│  │  │ • Validation Rules                                │  │    │
│  │  │ • Workflow Orchestration                          │  │    │
│  │  │                                                    │  │    │
│  │  │ Example: TodoUseCases                             │  │    │
│  │  │  - createTodo(data)                               │  │    │
│  │  │  - toggleTodo(id)                                 │  │    │
│  │  │  - deleteTodo(id)                                 │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  └────────────────────────┬─────────────────────────────────┘    │
│                           │                                      │
│                           │ Uses                                 │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                  REPOSITORIES                           │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │ Interface (ITodoRepository)                       │  │    │
│  │  │  - getAll()                                       │  │    │
│  │  │  - create(data)                                   │  │    │
│  │  │  - update(data)                                   │  │    │
│  │  │  - delete(id)                                     │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  │                           │                             │    │
│  │         ┌─────────────────┴─────────────────┐           │    │
│  │         ▼                                    ▼           │    │
│  │  ┌─────────────┐                    ┌──────────────┐    │    │
│  │  │  InMemory   │                    │     API      │    │    │
│  │  │ Repository  │                    │  Repository  │    │    │
│  │  └─────────────┘                    └──────────────┘    │    │
│  └────────────────────────────────────────────────────────┘    │
│                           │                                      │
│                           │ Uses                                 │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                     MODELS                              │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │ Domain Entities                                   │  │    │
│  │  │  - Todo                                           │  │    │
│  │  │  - User                                           │  │    │
│  │  │                                                    │  │    │
│  │  │ DTOs (Data Transfer Objects)                      │  │    │
│  │  │  - CreateTodoDTO                                  │  │    │
│  │  │  - UpdateTodoDTO                                  │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow

### User Action → Response

```
User clicks "Add Todo" in React Component
         │
         ▼
React Hook calls useTodoUseCases()
         │
         ▼
TodoUseCases.createTodo({ title: "..." })
         │
         ├─> Validates title is not empty
         │
         ▼
ITodoRepository.create({ title: "..." })
         │
         ▼
InMemoryTodoRepository stores new Todo
         │
         ▼
Returns Todo object
         │
         ▼
React Hook updates state
         │
         ▼
React Component re-renders with new todo
```

### Switching to Vue

```
User clicks "Add Todo" in Vue Component
         │
         ▼
Vue Composable calls useTodoUseCases()
         │
         ▼
TodoUseCases.createTodo({ title: "..." })  ← SAME BUSINESS LOGIC
         │
         ├─> Validates title is not empty
         │
         ▼
ITodoRepository.create({ title: "..." })
         │
         ▼
InMemoryTodoRepository stores new Todo     ← SAME DATA LAYER
         │
         ▼
Returns Todo object
         │
         ▼
Vue Composable updates ref
         │
         ▼
Vue Component re-renders with new todo
```

## Dependency Flow

```
┌─────────────────────────────────────────┐
│          Dependency Rule                 │
│                                          │
│  UI Layer → Core Layer ✅                │
│  Core Layer → UI Layer ❌ NEVER          │
│                                          │
│  Use Cases → Repositories ✅             │
│  Repositories → Use Cases ❌             │
│                                          │
│  Repositories → Models ✅                │
│  Models → Repositories ❌                │
└─────────────────────────────────────────┘
```

## File Structure

```
/workspaces/independent-framework-fe/
│
├── src/
│   ├── core/                          ← 100% Framework Agnostic
│   │   ├── models/
│   │   │   └── Todo.ts               ← Pure TypeScript interfaces
│   │   ├── repositories/
│   │   │   ├── ITodoRepository.ts    ← Interface (contract)
│   │   │   └── InMemoryTodoRepository.ts
│   │   ├── use-cases/
│   │   │   └── TodoUseCases.ts       ← Business logic
│   │   └── index.ts
│   │
│   └── ui/                            ← Framework Specific
│       ├── react/                     ← Current implementation
│       │   ├── components/
│       │   │   ├── TodoApp.tsx
│       │   │   └── TodoApp.css
│       │   ├── hooks/
│       │   │   └── useTodos.ts       ← React adapter
│       │   ├── providers/
│       │   │   └── TodoProvider.tsx  ← DI container
│       │   ├── main.tsx
│       │   ├── index.css
│       │   └── vite.config.ts
│       │
│       ├── vue/                       ← Future (easy to add)
│       │   ├── components/
│       │   ├── composables/           ← Vue adapter
│       │   └── main.ts
│       │
│       └── angular/                   ← Future (easy to add)
│           ├── components/
│           ├── services/              ← Angular adapter
│           └── main.ts
│
├── package.json
├── tsconfig.json
├── README.md
├── QUICKSTART.md
├── MIGRATION.md
└── ARCHITECTURE.md
```

## Benefits Visualization

```
┌─────────────────────────────────────────────────────────────┐
│                   TRADITIONAL APPROACH                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  React Component                                             │
│  ├── Business Logic ❌                                       │
│  ├── Validation ❌                                           │
│  ├── API Calls ❌                                            │
│  └── UI Rendering                                            │
│                                                              │
│  Problem: Everything coupled to React!                       │
│  Switching frameworks = Rewrite everything                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│               FRAMEWORK-AGNOSTIC APPROACH                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  React Component                                             │
│  └── UI Rendering ✅                                         │
│                                                              │
│  Core Layer (Reusable)                                       │
│  ├── Business Logic ✅                                       │
│  ├── Validation ✅                                           │
│  └── Data Access ✅                                          │
│                                                              │
│  Vue Component (uses same core!)                             │
│  └── UI Rendering ✅                                         │
│                                                              │
│  Solution: Business logic once, use everywhere!              │
│  Switching frameworks = Just change UI layer                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Testing Strategy

```
┌─────────────────────────────────────────┐
│         Unit Tests (Core)                │
│                                          │
│  ✅ Test business logic in isolation     │
│  ✅ No framework dependencies            │
│  ✅ Fast execution                       │
│  ✅ High coverage                        │
│                                          │
│  Example:                                │
│  test('creates todo', () => {            │
│    const useCase = new TodoUseCases()    │
│    const result = useCase.createTodo()   │
│    expect(result.title).toBe('...')      │
│  })                                      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│    Integration Tests (UI Adapters)       │
│                                          │
│  ✅ Test framework integration           │
│  ✅ Mock core layer                      │
│  ✅ Focus on UI behavior                 │
│                                          │
│  Example (React):                        │
│  test('renders todos', () => {           │
│    render(<TodoApp />)                   │
│    expect(screen.getByText(...))         │
│  })                                      │
└─────────────────────────────────────────┘
```

## Real-World Scenarios

### Scenario 1: API Integration

```
Before: InMemoryTodoRepository
After:  ApiTodoRepository

Changes needed:
❌ Core models? NO
❌ Use cases? NO
❌ UI components? NO
✅ Repository implementation? YES (create new class)
✅ DI container? YES (swap implementation)
```

### Scenario 2: Add Mobile App

```
New requirement: React Native mobile app

Changes needed:
❌ Core models? NO
❌ Use cases? NO
❌ Repositories? NO
✅ New UI layer? YES (src/ui/react-native/)

Code reuse: 100% of business logic
```

### Scenario 3: Switch to Vue

```
Decision: Use Vue instead of React

Changes needed:
❌ Core models? NO
❌ Use cases? NO
❌ Repositories? NO
✅ New UI layer? YES (src/ui/vue/)
✅ Remove React layer? OPTIONAL

Code reuse: 100% of business logic
```

## Summary

This architecture gives you:

- ✅ **Framework freedom**: Switch anytime
- ✅ **Code reuse**: Write once, use everywhere
- ✅ **Testability**: Test business logic independently
- ✅ **Maintainability**: Clear separation of concerns
- ✅ **Scalability**: Easy to add new features
- ✅ **Future-proof**: Not locked to any framework
