// Example: API-based repository implementation
// This demonstrates how you can swap data sources without changing business logic
// Now using abstracted HTTP client - swap between fetch, axios, or any other!

import { Todo, CreateTodoDTO, UpdateTodoDTO } from '../models/Todo';
import { ITodoRepository } from './ITodoRepository';
import { IHttpClient, FetchHttpClient } from '../http';

export class ApiTodoRepository implements ITodoRepository {
	private httpClient: IHttpClient;
	private endpoint: string;

	/**
	 * ApiTodoRepository with HTTP Client abstraction
	 *
	 * @param httpClient - Any HTTP client implementation (FetchHttpClient, AxiosHttpClient, etc.)
	 * @param endpoint - The API endpoint path (default: '/todos')
	 *
	 * Example:
	 *   const fetchClient = new FetchHttpClient('https://api.example.com');
	 *   const repository = new ApiTodoRepository(fetchClient);
	 *
	 *   // Later, swap to Axios without changing this code:
	 *   const axiosClient = new AxiosHttpClient('https://api.example.com');
	 *   const repository = new ApiTodoRepository(axiosClient);
	 */
	constructor(httpClient?: IHttpClient, endpoint: string = '/todos') {
		this.httpClient = httpClient || new FetchHttpClient();
		this.endpoint = endpoint;
	}

	async getAll(): Promise<Todo[]> {
		const response = await this.httpClient.get<Todo[]>(this.endpoint);
		return response.data;
	}

	async getAllByUserId(userId: string): Promise<Todo[]> {
		const response = await this.httpClient.get<Todo[]>(this.endpoint, { userId });
		return response.data;
	}

	async getById(id: string): Promise<Todo | null> {
		try {
			const response = await this.httpClient.get<Todo>(`${this.endpoint}/${id}`);
			return response.data;
		} catch (error) {
			// Return null if not found
			return null;
		}
	}

	async create(data: CreateTodoDTO, userId: string): Promise<Todo> {
		const response = await this.httpClient.post<Todo>(this.endpoint, { ...data, userId });
		return response.data;
	}

	async update(data: UpdateTodoDTO): Promise<Todo> {
		const response = await this.httpClient.patch<Todo>(`${this.endpoint}/${data.id}`, data);
		return response.data;
	}

	async delete(id: string): Promise<void> {
		await this.httpClient.delete(`${this.endpoint}/${id}`);
	}
}

/*
 * USAGE EXAMPLES:
 *
 * 1. Using Fetch (default):
 *    const httpClient = new FetchHttpClient('https://api.example.com');
 *    const todoRepository = new ApiTodoRepository(httpClient);
 *
 * 2. Using Axios:
 *    const httpClient = new AxiosHttpClient('https://api.example.com');
 *    const todoRepository = new ApiTodoRepository(httpClient);
 *
 * 3. Swap HTTP clients without changing ANY other code:
 *    - Business logic (TodoUseCases) stays the same
 *    - UI components stay the same
 *    - Only change the HTTP client in the provider/DI setup
 *
 * See src/ui/react/providers/TodoProvider.tsx for implementation
 */

// To use this instead of InMemoryTodoRepository:
// 1. Update src/ui/react/providers/TodoProvider.tsx:
//    const todoRepository = new ApiTodoRepository('https://api.example.com/todos');
//
// 2. That's it! No other changes needed.
//    - Business logic stays the same
//    - UI components stay the same
//    - Everything still works
