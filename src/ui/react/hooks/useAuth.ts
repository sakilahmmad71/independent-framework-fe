import { useState } from 'react';
import { useAuthContext, getAuthUseCases } from '../providers/AuthProvider';
import { LoginDTO, RegisterDTO } from '@core';

export const useAuth = () => {
	const { user, token, isAuthenticated, isLoading } = useAuthContext();
	const authUseCases = getAuthUseCases();
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const login = async (data: LoginDTO) => {
		try {
			setLoading(true);
			setError(null);
			const session = await authUseCases.login(data);

			// Save token to localStorage
			localStorage.setItem('authToken', session.token);

			// Reload page to trigger AuthProvider to validate session
			window.location.reload();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Login failed');
			throw err;
		} finally {
			setLoading(false);
		}
	};

	const register = async (data: RegisterDTO) => {
		try {
			setLoading(true);
			setError(null);
			const session = await authUseCases.register(data);

			// Save token to localStorage
			localStorage.setItem('authToken', session.token);

			// Reload page to trigger AuthProvider to validate session
			window.location.reload();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Registration failed');
			throw err;
		} finally {
			setLoading(false);
		}
	};

	const logout = async () => {
		try {
			if (token) {
				await authUseCases.logout(token);
			}
			localStorage.removeItem('authToken');
			window.location.reload();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Logout failed');
		}
	};

	return {
		user,
		token,
		isAuthenticated,
		isLoading,
		loading,
		error,
		login,
		register,
		logout,
	};
};
