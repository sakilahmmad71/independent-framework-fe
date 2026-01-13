// React adapter for the core business logic
import { createContext, useContext, ReactNode } from 'react';
import { TodoUseCases, InMemoryTodoRepository } from '@core';

// Create singleton instances of business logic
const todoRepository = new InMemoryTodoRepository();
const todoUseCases = new TodoUseCases(todoRepository);

// Context to provide business logic to React components
const TodoUseCasesContext = createContext<TodoUseCases | null>(null);

export const TodoProvider = ({ children }: { children: ReactNode }) => {
	return (
		<TodoUseCasesContext.Provider value={todoUseCases}>{children}</TodoUseCasesContext.Provider>
	);
};

// Hook to access business logic in React components
export const useTodoUseCases = () => {
	const context = useContext(TodoUseCasesContext);
	if (!context) {
		throw new Error('useTodoUseCases must be used within TodoProvider');
	}
	return context;
};
