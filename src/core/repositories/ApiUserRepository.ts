// API-based User Repository with HTTP client abstraction
import { User, UserWithPassword, RegisterDTO } from '../models/User';
import { IUserRepository } from './IUserRepository';
import { IHttpClient, FetchHttpClient } from '../http';

export class ApiUserRepository implements IUserRepository {
	private httpClient: IHttpClient;
	private endpoint: string;

	/**
	 * ApiUserRepository with HTTP Client abstraction
	 *
	 * @param httpClient - Any HTTP client implementation (FetchHttpClient, AxiosHttpClient, etc.)
	 * @param endpoint - The API endpoint path (default: '/users')
	 */
	constructor(httpClient?: IHttpClient, endpoint: string = '/users') {
		this.httpClient = httpClient || new FetchHttpClient();
		this.endpoint = endpoint;
	}

	async getById(id: string): Promise<User | null> {
		try {
			const response = await this.httpClient.get<User>(`${this.endpoint}/${id}`);
			return response.data;
		} catch (error) {
			return null;
		}
	}

	async getByEmail(email: string): Promise<UserWithPassword | null> {
		try {
			const response = await this.httpClient.get<UserWithPassword>(
				`${this.endpoint}/email/${encodeURIComponent(email)}`
			);
			return response.data;
		} catch (error) {
			return null;
		}
	}

	async emailExists(email: string): Promise<boolean> {
		try {
			const response = await this.httpClient.get<{ exists: boolean }>(
				`${this.endpoint}/check-email`,
				{ email }
			);
			return response.data.exists;
		} catch (error) {
			return false;
		}
	}

	async usernameExists(username: string): Promise<boolean> {
		try {
			const response = await this.httpClient.get<{ exists: boolean }>(
				`${this.endpoint}/check-username`,
				{ username }
			);
			return response.data.exists;
		} catch (error) {
			return false;
		}
	}

	async create(data: RegisterDTO): Promise<UserWithPassword> {
		const response = await this.httpClient.post<UserWithPassword>(this.endpoint, data);
		return response.data;
	}

	async update(id: string, data: Partial<User>): Promise<User> {
		const response = await this.httpClient.patch<User>(`${this.endpoint}/${id}`, data);
		return response.data;
	}

	async delete(id: string): Promise<void> {
		await this.httpClient.delete(`${this.endpoint}/${id}`);
	}
}

/*
 * USAGE EXAMPLES:
 *
 * 1. Using Fetch:
 *    const httpClient = new FetchHttpClient('https://api.example.com');
 *    const userRepository = new ApiUserRepository(httpClient);
 *
 * 2. Using Axios:
 *    const httpClient = new AxiosHttpClient('https://api.example.com');
 *    const userRepository = new ApiUserRepository(httpClient);
 *
 * 3. With Authentication Headers:
 *    const httpClient = new FetchHttpClient('https://api.example.com', {
 *      'Authorization': 'Bearer your-token-here'
 *    });
 *    const userRepository = new ApiUserRepository(httpClient);
 *
 * The HTTP client handles all the details. You can swap between
 * fetch, axios, or any other library without changing this code!
 */
