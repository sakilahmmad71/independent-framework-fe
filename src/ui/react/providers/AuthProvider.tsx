// React adapter for authentication business logic
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUseCases, InMemoryUserRepository, User, AuthSession } from '@core';

// Create singleton instances of auth business logic
const userRepository = new InMemoryUserRepository();
const authUseCases = new AuthUseCases(userRepository);

interface AuthContextType {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Check for existing session in localStorage
		const savedToken = localStorage.getItem('authToken');
		if (savedToken) {
			authUseCases
				.validateSession(savedToken)
				.then((validatedUser) => {
					if (validatedUser) {
						setUser(validatedUser);
						setToken(savedToken);
					} else {
						localStorage.removeItem('authToken');
					}
				})
				.finally(() => setIsLoading(false));
		} else {
			setIsLoading(false);
		}
	}, []);

	const contextValue: AuthContextType = {
		user,
		token,
		isAuthenticated: !!user && !!token,
		isLoading,
	};

	return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuthContext must be used within AuthProvider');
	}
	return context;
};

export const getAuthUseCases = () => authUseCases;
