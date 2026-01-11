// HTTP Client abstraction
// Allows swapping between fetch, axios, or any other HTTP library

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface HttpRequestConfig {
	url: string;
	method: HttpMethod;
	headers?: Record<string, string>;
	body?: any;
	params?: Record<string, string>;
}

export interface HttpResponse<T = any> {
	data: T;
	status: number;
	headers: Record<string, string>;
}

/**
 * HTTP Client interface
 *
 * This abstraction allows you to swap HTTP libraries without changing
 * any business logic or repository code.
 *
 * Implementations:
 * - FetchHttpClient (uses native fetch)
 * - AxiosHttpClient (uses axios)
 * - CustomHttpClient (your own implementation)
 */
export interface IHttpClient {
	request<T = any>(config: HttpRequestConfig): Promise<HttpResponse<T>>;

	get<T = any>(url: string, params?: Record<string, string>): Promise<HttpResponse<T>>;
	post<T = any>(url: string, body?: any): Promise<HttpResponse<T>>;
	put<T = any>(url: string, body?: any): Promise<HttpResponse<T>>;
	patch<T = any>(url: string, body?: any): Promise<HttpResponse<T>>;
	delete<T = any>(url: string): Promise<HttpResponse<T>>;
}
