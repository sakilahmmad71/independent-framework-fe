import { useState, useEffect } from 'react';
import { useTodoUseCases } from '../providers/TodoProvider';
import { useAuth } from './useAuth';
import { Todo } from '@core';

export const useTodos = () => {
	const todoUseCases = useTodoUseCases();
	const { user } = useAuth();
	const [todos, setTodos] = useState<Todo[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const loadTodos = async () => {
		if (!user) return;

		try {
			setLoading(true);
			const data = await todoUseCases.getAllTodos(user.id);
			setTodos(data);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load todos');
		} finally {
			setLoading(false);
		}
	};

	const addTodo = async (title: string) => {
		if (!user) {
			setError('You must be logged in to add todos');
			return;
		}

		try {
			await todoUseCases.createTodo({ title }, user.id);
			await loadTodos();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to add todo');
		}
	};

	const toggleTodo = async (id: string) => {
		if (!user) return;

		try {
			await todoUseCases.toggleTodo(id, user.id);
			await loadTodos();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to toggle todo');
		}
	};

	const deleteTodo = async (id: string) => {
		if (!user) return;

		try {
			await todoUseCases.deleteTodo(id, user.id);
			await loadTodos();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to delete todo');
		}
	};

	useEffect(() => {
		loadTodos();
	}, [user]);

	return {
		todos,
		loading,
		error,
		addTodo,
		toggleTodo,
		deleteTodo,
		refresh: loadTodos,
	};
};
