import { useState } from 'react';
import { useTodos } from '../hooks/useTodos';
import { useAuth } from '../hooks/useAuth';
import './TodoApp.css';

export const TodoApp = () => {
	const { todos, loading, error, addTodo, toggleTodo, deleteTodo } = useTodos();
	const { user, logout } = useAuth();
	const [inputValue, setInputValue] = useState('');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (inputValue.trim()) {
			await addTodo(inputValue);
			setInputValue('');
		}
	};

	const handleLogout = async () => {
		await logout();
	};

	const activeTodos = todos.filter((todo) => !todo.completed);
	const completedTodos = todos.filter((todo) => todo.completed);

	return (
		<div className='todo-app'>
			<div className='todo-header'>
				<div>
					<h1>Todo App - React</h1>
					<p className='framework-note'>UI Framework: React (Business Logic: Framework-Agnostic)</p>
				</div>
				<div className='user-section'>
					<span className='user-greeting'>👋 {user?.username}</span>
					<button onClick={handleLogout} className='logout-button'>
						Logout
					</button>
				</div>
			</div>

			<form onSubmit={handleSubmit} className='todo-form'>
				<input
					type='text'
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					placeholder='What needs to be done?'
					className='todo-input'
				/>
				<button type='submit' className='add-button'>
					Add
				</button>
			</form>

			{error && <div className='error'>{error}</div>}

			{loading ? (
				<div className='loading'>Loading...</div>
			) : (
				<>
					<div className='stats'>
						<span>Active: {activeTodos.length}</span>
						<span>Completed: {completedTodos.length}</span>
						<span>Total: {todos.length}</span>
					</div>

					<div className='todo-list'>
						{todos.length === 0 ? (
							<p className='empty-state'>No todos yet. Add one above!</p>
						) : (
							todos.map((todo) => (
								<div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
									<input
										type='checkbox'
										checked={todo.completed}
										onChange={() => toggleTodo(todo.id)}
										className='todo-checkbox'
									/>
									<span className='todo-title'>{todo.title}</span>
									<button onClick={() => deleteTodo(todo.id)} className='delete-button'>
										Delete
									</button>
								</div>
							))
						)}
					</div>
				</>
			)}
		</div>
	);
};
