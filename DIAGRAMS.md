# Framework-Independent Architecture Diagrams

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        UI LAYER                                 │
│              (Framework Specific - Replaceable)                 │
│                                                                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐ │
│  │   React    │  │    Vue     │  │   Svelte   │  │ Vanilla  │ │
│  │ Components │  │ Components │  │ Components │  │    JS    │ │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └────┬─────┘ │
└────────┼───────────────┼───────────────┼──────────────┼────────┘
         │               │               │              │
         └───────────────┴───────────────┴──────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRAMEWORK BINDINGS                           │
│            (Hooks, Composables, Store Connectors)               │
│                                                                 │
│  • Subscribe to state changes                                   │
│  • Call use case methods                                        │
│  • Handle framework-specific lifecycle                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                 CORE BUSINESS LOGIC                             │
│              (Framework Independent - Stable)                   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    USE CASES                             │  │
│  │  • TodoUseCase: Create, Update, Delete, Toggle          │  │
│  │  • AuthUseCase: Login, Logout, Check Auth               │  │
│  │  • Business Rules & Validation                           │  │
│  │  • State Management & Observers                          │  │
│  └────────────────┬──────────────────────┬──────────────────┘  │
│                   │                      │                      │
│  ┌────────────────▼─────┐   ┌───────────▼──────────────────┐  │
│  │     ENTITIES         │   │         PORTS                │  │
│  │  • Todo              │   │  • TodoRepository (interface)│  │
│  │  • User              │   │  • AuthRepository (interface)│  │
│  │  • Domain Models     │   │  • Observable (interface)    │  │
│  └──────────────────────┘   └──────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ADAPTERS                                   │
│          (Repository Implementations - Swappable)               │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │   InMemory       │  │  LocalStorage    │  │   REST API   │ │
│  │   Repository     │  │   Repository     │  │  Repository  │ │
│  └────────┬─────────┘  └────────┬─────────┘  └──────┬───────┘ │
└───────────┼────────────────────┼────────────────────┼──────────┘
            │                    │                    │
            ▼                    ▼                    ▼
     ┌──────────┐         ┌──────────┐         ┌──────────┐
     │   RAM    │         │ Browser  │         │  Server  │
     │          │         │ Storage  │         │   API    │
     └──────────┘         └──────────┘         └──────────┘
```

## Data Flow: Creating a Todo

```
User Action (Framework-Specific)
        │
        ▼
┌─────────────────────────────────────┐
│   UI Component                      │
│   (React/Vue/Svelte/Vanilla)        │
│                                     │
│   onClick={() =>                    │
│     createTodo("Title", "Desc")     │
│   }                                 │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   Framework Binding                 │
│   (Hook/Composable)                 │
│                                     │
│   await todoUseCase.createTodo({    │
│     title: "Title",                 │
│     description: "Desc"             │
│   })                                │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   TodoUseCase (Business Logic)      │
│   ✓ Validate title not empty        │
│   ✓ Validate title length >= 3      │
│   ✓ Call repository.create()        │
│   ✓ Update local state              │
│   ✓ Notify observers                │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   TodoRepository (Interface/Port)   │
│   create(input): Promise<Todo>      │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   Concrete Adapter                  │
│   (InMemory/LocalStorage/API)       │
│   • Store todo in data source       │
│   • Return created todo             │
└─────────────┬───────────────────────┘
              │
              ▼
         Todo Created
              │
              ▼
┌─────────────────────────────────────┐
│   Observable Notification           │
│   todoUseCase.notifySubscribers()   │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   Framework Binding                 │
│   Receives updated todos list       │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   UI Component Re-renders           │
│   Shows new todo in the list        │
└─────────────────────────────────────┘
```

## Dependency Graph

```
┌──────────────────────────────────────────────────────────┐
│                   DEPENDENCY RULES                       │
│                                                          │
│  ✓ Outer layers can depend on inner layers             │
│  ✗ Inner layers cannot depend on outer layers          │
│  ✓ Core business logic has zero external dependencies  │
└──────────────────────────────────────────────────────────┘

         ┌───────────────────────────────┐
         │       UI Components           │ ◄─── Can use any framework
         │    (React, Vue, etc.)         │      (frequently changes)
         └───────────┬───────────────────┘
                     │ depends on
                     ▼
         ┌───────────────────────────────┐
         │    Framework Bindings         │ ◄─── Framework-specific code
         │  (Hooks, Composables)         │      (changes with framework)
         └───────────┬───────────────────┘
                     │ depends on
                     ▼
         ┌───────────────────────────────┐
         │      USE CASES                │ ◄─── Business Logic
         │   (TodoUseCase, etc.)         │      (stable, rarely changes)
         └───────┬────────────┬──────────┘
                 │            │
       depends on│            │depends on
                 ▼            ▼
         ┌──────────┐  ┌──────────────┐
         │ ENTITIES │  │    PORTS     │ ◄─── Core Domain
         │          │  │ (Interfaces) │      (very stable)
         └──────────┘  └──────┬───────┘
                              │
                              │ implemented by
                              ▼
                      ┌───────────────┐
                      │   ADAPTERS    │ ◄─── Data Access
                      │ (Repositories)│      (swappable)
                      └───────────────┘
```

## Framework Switching Process

```
BEFORE (React)                    AFTER (Vue)
─────────────                    ──────────

┌─────────────┐                  ┌─────────────┐
│   React     │                  │     Vue     │
│ Components  │                  │  Components │
└──────┬──────┘                  └──────┬──────┘
       │                                │
       ▼                                ▼
┌─────────────┐                  ┌─────────────┐
│   useState  │    REWRITE →     │   ref()     │
│  useEffect  │                  │  onMounted  │
└──────┬──────┘                  └──────┬──────┘
       │                                │
       │                                │
       └────────────┬───────────────────┘
                    │
                    ▼
            ┌───────────────┐
            │  USE CASES    │ ◄── NO CHANGES!
            │ (Business     │     (Same code works
            │  Logic)       │      with both)
            └───────┬───────┘
                    │
                    ▼
            ┌───────────────┐
            │   ADAPTERS    │ ◄── NO CHANGES!
            │ (Repositories)│
            └───────────────┘
```

## Code Organization

```
independent-framework-fe/
│
├── src/
│   ├── core/                      ← FRAMEWORK INDEPENDENT
│   │   ├── entities/              ← Domain models
│   │   │   ├── Todo.ts
│   │   │   └── User.ts
│   │   │
│   │   ├── usecases/              ← Business logic
│   │   │   ├── TodoUseCase.ts
│   │   │   └── AuthUseCase.ts
│   │   │
│   │   ├── ports/                 ← Interfaces
│   │   │   ├── TodoRepository.ts
│   │   │   ├── AuthRepository.ts
│   │   │   └── Observable.ts
│   │   │
│   │   └── __tests__/             ← Tests (no framework)
│   │       ├── TodoUseCase.test.ts
│   │       └── AuthUseCase.test.ts
│   │
│   └── adapters/                  ← SWAPPABLE IMPLEMENTATIONS
│       ├── InMemoryTodoRepository.ts
│       ├── InMemoryAuthRepository.ts
│       └── LocalStorageTodoRepository.ts
│
└── examples/                      ← FRAMEWORK SPECIFIC
    ├── react/                     ← React example
    │   ├── useTodoUseCase.ts     (Hook)
    │   └── TodoApp.tsx
    │
    ├── vue/                       ← Vue example
    │   └── TodoApp.vue           (Composable inside)
    │
    └── vanilla/                   ← Vanilla JS example
        ├── app.ts
        └── index.html

KEY:
├── core/         ← Write once, use everywhere
├── adapters/     ← Swap data sources easily
└── examples/     ← Swap UI frameworks easily
```

## Benefits Visualization

```
Traditional Approach:
┌──────────────────────────────────────────────────────┐
│           Monolithic Frontend App                    │
│                                                      │
│  React Components                                    │
│       ↕                                              │
│  Business Logic (mixed with React)                   │
│       ↕                                              │
│  Data Fetching (mixed with React)                    │
└──────────────────────────────────────────────────────┘

❌ Tight coupling
❌ Hard to test business logic
❌ Framework migration = rewrite everything
❌ Can't reuse logic across frameworks


Framework-Independent Approach:
┌──────────────────────────────────────────────────────┐
│  UI Layer (React)              ← Easily swappable    │
└────────────────┬─────────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────────┐
│  Business Logic Layer          ← Stable & reusable   │
└────────────────┬─────────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────────┐
│  Data Layer (Adapters)         ← Easily swappable    │
└──────────────────────────────────────────────────────┘

✅ Loose coupling
✅ Easy to test business logic
✅ Framework migration = rewrite only UI layer (10-20%)
✅ Reuse logic in React, Vue, Svelte, etc.
```
