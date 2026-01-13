// Fetch-based HTTP client implementation
import { IHttpClient, HttpRequestConfig, HttpResponse } from './IHttpClient';

export class FetchHttpClient implements IHttpClient {
	private baseUrl: string;
	private defaultHeaders: Record<string, string>;

	constructor(baseUrl: string = '', defaultHeaders: Record<string, string> = {}) {
		this.baseUrl = baseUrl;
		this.defaultHeaders = {
			'Content-Type': 'application/json',
			...defaultHeaders,
		};
	}

	async request<T = any>(config: HttpRequestConfig): Promise<HttpResponse<T>> {
		const url = this.buildUrl(config.url, config.params);
		const headers = { ...this.defaultHeaders, ...config.headers };

		const options: RequestInit = {
			method: config.method,
			headers,
		};

		if (config.body) {
			options.body = JSON.stringify(config.body);
		}

		const response = await fetch(url, options);

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const data = await response.json();
		const responseHeaders = this.extractHeaders(response.headers);

		return {
			data,
			status: response.status,
			headers: responseHeaders,
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

	private buildUrl(path: string, params?: Record<string, string>): string {
		const url = this.baseUrl + path;

		if (!params) {
			return url;
		}

		const queryString = Object.entries(params)
			.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
			.join('&');

		return `${url}?${queryString}`;
	}

	private extractHeaders(headers: Headers): Record<string, string> {
		const result: Record<string, string> = {};
		headers.forEach((value, key) => {
			result[key] = value;
		});
		return result;
	}
}
