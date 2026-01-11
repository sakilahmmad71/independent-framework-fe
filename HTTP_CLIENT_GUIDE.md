# HTTP Client Abstraction Guide

## 🎯 Overview

API calls sit in **Repository implementations** (e.g., `ApiTodoRepository`, `ApiUserRepository`), and the HTTP client is **abstracted** behind an interface. This allows you to swap between `fetch`, `axios`, or any other HTTP library **without changing a single line of business logic or UI code**.

## 📍 Where API Calls Live

```
src/
├── core/
│   ├── http/                          ← HTTP Client Abstraction Layer
│   │   ├── IHttpClient.ts             ← Interface (contract)
│   │   ├── FetchHttpClient.ts         ← Fetch implementation
│   │   └── AxiosHttpClient.ts         ← Axios implementation
│   │
│   └── repositories/
│       ├── ApiTodoRepository.ts       ← Uses IHttpClient (not fetch directly!)
│       └── ApiUserRepository.ts       ← Uses IHttpClient (not fetch directly!)
```

## 🔄 How It Works

### The Abstraction Layers

```
UI Layer (React/Vue/Angular)
        ↓
Use Cases (TodoUseCases, AuthUseCases)
        ↓
Repository Interface (ITodoRepository)
        ↓
Repository Implementation (ApiTodoRepository)
        ↓
HTTP Client Interface (IHttpClient)         ← SWAP HAPPENS HERE
        ↓
HTTP Client Implementation (FetchHttpClient OR AxiosHttpClient)
        ↓
Network
```

### Key Point

**You can swap HTTP clients at the IHttpClient level without changing:**

- ✅ Business logic (use cases)
- ✅ Repository implementations
- ✅ UI components
- ✅ Any other code

---

## 🚀 Quick Start

### 1. Using Fetch (Default)

```typescript
// src/ui/react/providers/TodoProvider.tsx
import { FetchHttpClient, ApiTodoRepository } from '@core';

const httpClient = new FetchHttpClient('https://api.example.com');
const todoRepository = new ApiTodoRepository(httpClient);
```

### 2. Switching to Axios

```bash
# Install axios
npm install axios
```

```typescript
// src/ui/react/providers/TodoProvider.tsx
import { AxiosHttpClient, ApiTodoRepository } from '@core';

const httpClient = new AxiosHttpClient('https://api.example.com');
const todoRepository = new ApiTodoRepository(httpClient); // ← Same!
```

**That's it!** Everything else stays the same.

---

## 📖 Detailed Examples

### Example 1: Basic Fetch Setup

```typescript
// src/ui/react/providers/TodoProvider.tsx
import { createContext, ReactNode } from 'react';
import { FetchHttpClient, ApiTodoRepository, TodoUseCases } from '@core';

// Create HTTP client
const httpClient = new FetchHttpClient('https://api.example.com');

// Create repository with HTTP client
const todoRepository = new ApiTodoRepository(httpClient);

// Create use cases (business logic)
const todoUseCases = new TodoUseCases(todoRepository);

// Provide to React app
export const TodoContext = createContext(todoUseCases);

export const TodoProvider = ({ children }: { children: ReactNode }) => {
	return <TodoContext.Provider value={todoUseCases}>{children}</TodoContext.Provider>;
};
```

### Example 2: Switching to Axios

```typescript
// src/ui/react/providers/TodoProvider.tsx
import { createContext, ReactNode } from 'react';
import {
	AxiosHttpClient, // ← Only this changed!
	ApiTodoRepository,
	TodoUseCases,
} from '@core';

// Create HTTP client (now using Axios)
const httpClient = new AxiosHttpClient('https://api.example.com');

// Everything else stays EXACTLY the same
const todoRepository = new ApiTodoRepository(httpClient);
const todoUseCases = new TodoUseCases(todoRepository);

export const TodoContext = createContext(todoUseCases);

export const TodoProvider = ({ children }: { children: ReactNode }) => {
	return <TodoContext.Provider value={todoUseCases}>{children}</TodoContext.Provider>;
};
```

### Example 3: Adding Authentication Headers

```typescript
// src/ui/react/providers/TodoProvider.tsx
import { FetchHttpClient, ApiTodoRepository } from '@core';

// Add default headers (like auth token)
const httpClient = new FetchHttpClient('https://api.example.com', {
	Authorization: `Bearer ${localStorage.getItem('authToken')}`,
	'X-Custom-Header': 'value',
});

const todoRepository = new ApiTodoRepository(httpClient);
```

### Example 4: Environment-Based Setup

```typescript
// src/ui/react/providers/TodoProvider.tsx
import { FetchHttpClient, AxiosHttpClient, ApiTodoRepository } from '@core';

// Choose HTTP client based on environment
const httpClient =
	process.env.USE_AXIOS === 'true'
		? new AxiosHttpClient(process.env.API_URL!)
		: new FetchHttpClient(process.env.API_URL!);

const todoRepository = new ApiTodoRepository(httpClient);
```

---

## 🔧 Creating Custom HTTP Clients

You can create your own HTTP client for any library!

### Example: SuperAgent HTTP Client

```typescript
// src/core/http/SuperAgentHttpClient.ts
import { IHttpClient, HttpRequestConfig, HttpResponse } from './IHttpClient';
import superagent from 'superagent';

export class SuperAgentHttpClient implements IHttpClient {
	private baseUrl: string;
	private defaultHeaders: Record<string, string>;

	constructor(baseUrl: string = '', defaultHeaders: Record<string, string> = {}) {
		this.baseUrl = baseUrl;
		this.defaultHeaders = defaultHeaders;
	}

	async request<T = any>(config: HttpRequestConfig): Promise<HttpResponse<T>> {
		let request = superagent(config.method, this.baseUrl + config.url);

		// Add headers
		request = request.set({ ...this.defaultHeaders, ...config.headers });

		// Add query params
		if (config.params) {
			request = request.query(config.params);
		}

		// Add body
		if (config.body) {
			request = request.send(config.body);
		}

		const response = await request;

		return {
			data: response.body,
			status: response.status,
			headers: response.headers,
		};
	}

	async get<T = any>(url: string, params?: Record<string, string>) {
		return this.request<T>({ url, method: 'GET', params });
	}

	async post<T = any>(url: string, body?: any) {
		return this.request<T>({ url, method: 'POST', body });
	}

	// ... other methods
}
```

Then use it:

```typescript
import { SuperAgentHttpClient, ApiTodoRepository } from '@core';

const httpClient = new SuperAgentHttpClient('https://api.example.com');
const todoRepository = new ApiTodoRepository(httpClient);
```

---

## 🎨 Architecture Benefits

### 1. Separation of Concerns

```typescript
// ✅ Repository focuses on data mapping
class ApiTodoRepository {
	async getAll() {
		const response = await this.httpClient.get('/todos');
		return response.data; // Just transform data
	}
}

// ✅ HTTP client focuses on HTTP details
class FetchHttpClient {
	async get(url) {
		// Handle fetch, errors, headers, etc.
	}
}
```

### 2. Easy Testing

```typescript
// Mock HTTP client for testing
class MockHttpClient implements IHttpClient {
	async get<T>() {
		return {
			data: [{ id: '1', title: 'Test' }] as T,
			status: 200,
			headers: {},
		};
	}
	// ... other methods
}

// Test repository with mock
const mockClient = new MockHttpClient();
const repository = new ApiTodoRepository(mockClient);
const todos = await repository.getAll(); // Returns mock data
```

### 3. Framework Independence

```typescript
// Works with React
const ReactApp = () => {
	const httpClient = new FetchHttpClient('https://api.example.com');
	const todoRepository = new ApiTodoRepository(httpClient);
	// ...
};

// Works with Vue (same HTTP client & repository!)
const app = createApp({
	setup() {
		const httpClient = new FetchHttpClient('https://api.example.com');
		const todoRepository = new ApiTodoRepository(httpClient);
		// ...
	},
});

// Works with Angular (same HTTP client & repository!)
@Injectable()
class TodoService {
	private httpClient = new FetchHttpClient('https://api.example.com');
	private repository = new ApiTodoRepository(this.httpClient);
	// ...
}
```

---

## 🔍 Under the Hood

### How ApiTodoRepository Uses IHttpClient

```typescript
// src/core/repositories/ApiTodoRepository.ts
export class ApiTodoRepository implements ITodoRepository {
	private httpClient: IHttpClient; // ← Interface, not implementation!

	constructor(httpClient?: IHttpClient) {
		this.httpClient = httpClient || new FetchHttpClient();
	}

	async getAll(): Promise<Todo[]> {
		// Uses interface methods (works with ANY implementation)
		const response = await this.httpClient.get<Todo[]>('/todos');
		return response.data;
	}

	async create(data: CreateTodoDTO, userId: string): Promise<Todo> {
		const response = await this.httpClient.post<Todo>('/todos', { ...data, userId });
		return response.data;
	}
}
```

### FetchHttpClient Implementation

```typescript
// src/core/http/FetchHttpClient.ts
export class FetchHttpClient implements IHttpClient {
	async get<T>(url: string, params?: Record<string, string>) {
		const fullUrl = this.buildUrl(url, params);
		const response = await fetch(fullUrl, {
			method: 'GET',
			headers: this.defaultHeaders,
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}

		return {
			data: await response.json(),
			status: response.status,
			headers: this.extractHeaders(response.headers),
		};
	}
}
```

### AxiosHttpClient Implementation

```typescript
// src/core/http/AxiosHttpClient.ts
export class AxiosHttpClient implements IHttpClient {
	private axiosInstance: AxiosInstance;

	constructor(baseUrl: string, headers: Record<string, string> = {}) {
		this.axiosInstance = axios.create({
			baseURL: baseUrl,
			headers: { 'Content-Type': 'application/json', ...headers },
		});
	}

	async get<T>(url: string, params?: Record<string, string>) {
		const response = await this.axiosInstance.get(url, { params });

		return {
			data: response.data,
			status: response.status,
			headers: response.headers,
		};
	}
}
```

**Both implement the same interface, so they're interchangeable!**

---

## 🎯 Common Scenarios

### Scenario 1: Add Request/Response Interceptors

```typescript
// Create custom HTTP client with interceptors
class AuthenticatedHttpClient extends AxiosHttpClient {
	constructor(baseUrl: string) {
		super(baseUrl);

		// Add auth token to all requests
		this.axiosInstance.interceptors.request.use((config) => {
			const token = localStorage.getItem('authToken');
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
			return config;
		});

		// Handle 401 errors globally
		this.axiosInstance.interceptors.response.use(
			(response) => response,
			(error) => {
				if (error.response?.status === 401) {
					// Redirect to login
					window.location.href = '/login';
				}
				return Promise.reject(error);
			}
		);
	}
}

// Use it
const httpClient = new AuthenticatedHttpClient('https://api.example.com');
const todoRepository = new ApiTodoRepository(httpClient);
```

### Scenario 2: Add Retry Logic

```typescript
class RetryHttpClient implements IHttpClient {
	constructor(private baseClient: IHttpClient, private maxRetries: number = 3) {}

	async request<T>(config: HttpRequestConfig): Promise<HttpResponse<T>> {
		let lastError: Error;

		for (let i = 0; i < this.maxRetries; i++) {
			try {
				return await this.baseClient.request<T>(config);
			} catch (error) {
				lastError = error as Error;
				await this.delay(Math.pow(2, i) * 1000); // Exponential backoff
			}
		}

		throw lastError!;
	}

	private delay(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	// Delegate other methods...
	async get<T>(url: string, params?: Record<string, string>) {
		return this.request<T>({ url, method: 'GET', params });
	}
}

// Use it
const baseClient = new FetchHttpClient('https://api.example.com');
const retryClient = new RetryHttpClient(baseClient, 3);
const todoRepository = new ApiTodoRepository(retryClient);
```

### Scenario 3: Add Logging

```typescript
class LoggingHttpClient implements IHttpClient {
	constructor(private baseClient: IHttpClient) {}

	async request<T>(config: HttpRequestConfig): Promise<HttpResponse<T>> {
		console.log(`[HTTP] ${config.method} ${config.url}`, config);

		const startTime = Date.now();
		const response = await this.baseClient.request<T>(config);
		const duration = Date.now() - startTime;

		console.log(`[HTTP] ${config.method} ${config.url} - ${response.status} (${duration}ms)`);

		return response;
	}

	// Delegate other methods...
}

// Use it
const baseClient = new FetchHttpClient('https://api.example.com');
const loggingClient = new LoggingHttpClient(baseClient);
const todoRepository = new ApiTodoRepository(loggingClient);
```

---

## 📊 Comparison: Before vs After

### ❌ Before (Tight Coupling)

```typescript
// Repository directly uses fetch
class ApiTodoRepository {
	async getAll() {
		const response = await fetch('/api/todos'); // ← Tightly coupled to fetch
		return response.json();
	}
}

// To switch to axios, you'd have to:
// 1. Change this repository
// 2. Change all tests
// 3. Risk breaking things
```

### ✅ After (Loose Coupling)

```typescript
// Repository uses interface
class ApiTodoRepository {
	constructor(private httpClient: IHttpClient) {} // ← Interface!

	async getAll() {
		const response = await this.httpClient.get('/todos'); // ← Works with ANY implementation
		return response.data;
	}
}

// To switch to axios:
// 1. Change ONE line in provider/DI setup
// 2. Everything else stays the same
// 3. No risk of breaking anything
```

---

## 🚀 Migration Guide

### Current Setup (InMemory)

```typescript
// src/ui/react/providers/TodoProvider.tsx
const todoRepository = new InMemoryTodoRepository();
const todoUseCases = new TodoUseCases(todoRepository);
```

### Switch to API with Fetch

```typescript
// src/ui/react/providers/TodoProvider.tsx
import { FetchHttpClient, ApiTodoRepository, TodoUseCases } from '@core';

const httpClient = new FetchHttpClient('https://api.example.com');
const todoRepository = new ApiTodoRepository(httpClient);
const todoUseCases = new TodoUseCases(todoRepository);
```

### Switch to API with Axios

```bash
npm install axios
```

```typescript
// Uncomment AxiosHttpClient implementation in src/core/http/AxiosHttpClient.ts

// src/ui/react/providers/TodoProvider.tsx
import { AxiosHttpClient, ApiTodoRepository, TodoUseCases } from '@core';

const httpClient = new AxiosHttpClient('https://api.example.com');
const todoRepository = new ApiTodoRepository(httpClient);
const todoUseCases = new TodoUseCases(todoRepository);
```

---

## 📝 Summary

### Where API Calls Sit

```
src/core/repositories/
├── ApiTodoRepository.ts       ← API calls for todos
└── ApiUserRepository.ts       ← API calls for users
```

### HTTP Client Abstraction

```
src/core/http/
├── IHttpClient.ts            ← Interface (contract)
├── FetchHttpClient.ts        ← Fetch implementation
└── AxiosHttpClient.ts        ← Axios implementation
```

### Key Benefits

1. ✅ **Swap HTTP libraries** without changing business logic
2. ✅ **Easy testing** with mock HTTP clients
3. ✅ **Framework independence** - works with React, Vue, Angular
4. ✅ **Separation of concerns** - HTTP details separate from data logic
5. ✅ **Add features easily** - interceptors, retry logic, logging

### The Power

**Change ONE line in your provider to switch HTTP libraries:**

```typescript
// From this:
const httpClient = new FetchHttpClient('https://api.example.com');

// To this:
const httpClient = new AxiosHttpClient('https://api.example.com');

// Everything else stays the same! 🎉
```

---

**Your API calls are now completely abstracted and interchangeable!** 🚀
