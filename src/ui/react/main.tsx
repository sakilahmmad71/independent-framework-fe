import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './providers/AuthProvider';
import { TodoProvider } from './providers/TodoProvider';
import { useAuth } from './hooks/useAuth';
import { LoginForm } from './components/AuthForms';
import { TodoApp } from './components/TodoApp';
import './index.css';

const App = () => {
	const { isAuthenticated, isLoading } = useAuth();

	if (isLoading) {
		return (
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					height: '100vh',
				}}>
				<div>Loading...</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return <LoginForm />;
	}

	return <TodoApp />;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<AuthProvider>
			<TodoProvider>
				<App />
			</TodoProvider>
		</AuthProvider>
	</React.StrictMode>
);
