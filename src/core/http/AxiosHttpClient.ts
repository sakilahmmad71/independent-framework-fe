// Axios-based HTTP client implementation
// Note: Requires 'axios' package: npm install axios

import { IHttpClient, HttpRequestConfig, HttpResponse } from './IHttpClient';

// Uncomment when axios is installed:
// import axios, { AxiosInstance } from 'axios';

/**
 * Axios HTTP Client
 *
 * To use this:
 * 1. Install axios: npm install axios
 * 2. Uncomment the axios import above
 * 3. Uncomment the implementation below
 * 4. Swap in your repository: new ApiTodoRepository(new AxiosHttpClient(...))
 */
export class AxiosHttpClient implements IHttpClient {
	// private axiosInstance: AxiosInstance;

	constructor(baseUrl: string = '', defaultHeaders: Record<string, string> = {}) {
		// Uncomment when axios is installed:
		/*
		this.axiosInstance = axios.create({
			baseURL: baseUrl,
			headers: {
				'Content-Type': 'application/json',
				...defaultHeaders,
			},
		});
		*/
		throw new Error('AxiosHttpClient requires axios package. Run: npm install axios');
	}

	async request<T = any>(config: HttpRequestConfig): Promise<HttpResponse<T>> {
		// Uncomment when axios is installed:
		/*
		const response = await this.axiosInstance.request({
			url: config.url,
			method: config.method,
			headers: config.headers,
			data: config.body,
			params: config.params,
		});

		return {
			data: response.data,
			status: response.status,
			headers: response.headers as Record<string, string>,
		};
		*/
		throw new Error('AxiosHttpClient requires axios package');
	}

	async get<T = any>(url: string, params?: Record<string, string>): Promise<HttpResponse<T>> {
		return this.request<T>({ url, method: 'GET', params });
	}

	async post<T = any>(url: string, body?: any): Promise<HttpResponse<T>> {
		return this.request<T>({ url, method: 'POST', body });
	}

	async put<T = any>(url: string, body?: any): Promise<HttpResponse<T>> {
		return this.request<T>({ url, method: 'PUT', body });
	}

	async patch<T = any>(url: string, body?: any): Promise<HttpResponse<T>> {
		return this.request<T>({ url, method: 'PATCH', body });
	}

	async delete<T = any>(url: string): Promise<HttpResponse<T>> {
		return this.request<T>({ url, method: 'DELETE' });
	}
}

/*
// WORKING IMPLEMENTATION (uncomment when axios is installed):

import axios, { AxiosInstance } from 'axios';

export class AxiosHttpClient implements IHttpClient {
	private axiosInstance: AxiosInstance;

	constructor(baseUrl: string = '', defaultHeaders: Record<string, string> = {}) {
		this.axiosInstance = axios.create({
			baseURL: baseUrl,
			headers: {
				'Content-Type': 'application/json',
				...defaultHeaders,
			},
		});

		// Add interceptors for auth, logging, etc.
		this.axiosInstance.interceptors.request.use((config) => {
			// Add auth token
			const token = localStorage.getItem('authToken');
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
			return config;
		});

		this.axiosInstance.interceptors.response.use(
			(response) => response,
			(error) => {
				// Handle 401 unauthorized
				if (error.response?.status === 401) {
					// Redirect to login or refresh token
				}
				return Promise.reject(error);
			}
		);
	}

	async request<T = any>(config: HttpRequestConfig): Promise<HttpResponse<T>> {
		const response = await this.axiosInstance.request({
			url: config.url,
			method: config.method,
			headers: config.headers,
			data: config.body,
			params: config.params,
		});

		return {
			data: response.data,
			status: response.status,
			headers: response.headers as Record<string, string>,
		};
	}

	async get<T = any>(url: string, params?: Record<string, string>): Promise<HttpResponse<T>> {
		return this.request<T>({ url, method: 'GET', params });
	}

	async post<T = any>(url: string, body?: any): Promise<HttpResponse<T>> {
		return this.request<T>({ url, method: 'POST', body });
	}

	async put<T = any>(url: string, body?: any): Promise<HttpResponse<T>> {
		return this.request<T>({ url, method: 'PUT', body });
	}

	async patch<T = any>(url: string, body?: any): Promise<HttpResponse<T>> {
		return this.request<T>({ url, method: 'PATCH', body });
	}

	async delete<T = any>(url: string): Promise<HttpResponse<T>> {
		return this.request<T>({ url, method: 'DELETE' });
	}
}
*/
