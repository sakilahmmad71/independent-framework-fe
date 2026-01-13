import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import './AuthForms.css';

export const LoginForm = () => {
	const { login, loading, error } = useAuth();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showRegister, setShowRegister] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await login({ email, password });
		} catch (err) {
			// Error is handled by useAuth hook
		}
	};

	if (showRegister) {
		return <RegisterForm onBackToLogin={() => setShowRegister(false)} />;
	}

	return (
		<div className='auth-container'>
			<div className='auth-card'>
				<h1>Welcome Back</h1>
				<p className='auth-subtitle'>Sign in to manage your todos</p>

				<form onSubmit={handleSubmit} className='auth-form'>
					{error && <div className='auth-error'>{error}</div>}

					<div className='form-group'>
						<label htmlFor='email'>Email</label>
						<input
							id='email'
							type='email'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder='your@email.com'
							required
							disabled={loading}
						/>
					</div>

					<div className='form-group'>
						<label htmlFor='password'>Password</label>
						<input
							id='password'
							type='password'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder='Enter your password'
							required
							disabled={loading}
						/>
					</div>

					<button type='submit' className='auth-button' disabled={loading}>
						{loading ? 'Signing in...' : 'Sign In'}
					</button>
				</form>

				<div className='auth-footer'>
					Don't have an account?{' '}
					<button onClick={() => setShowRegister(true)} className='auth-link'>
						Sign up
					</button>
				</div>
			</div>
		</div>
	);
};

interface RegisterFormProps {
	onBackToLogin: () => void;
}

export const RegisterForm = ({ onBackToLogin }: RegisterFormProps) => {
	const { register, loading, error } = useAuth();
	const [email, setEmail] = useState('');
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [localError, setLocalError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLocalError(null);

		if (password !== confirmPassword) {
			setLocalError('Passwords do not match');
			return;
		}

		try {
			await register({ email, username, password });
		} catch (err) {
			// Error is handled by useAuth hook
		}
	};

	return (
		<div className='auth-container'>
			<div className='auth-card'>
				<h1>Create Account</h1>
				<p className='auth-subtitle'>Sign up to start managing your todos</p>

				<form onSubmit={handleSubmit} className='auth-form'>
					{(error || localError) && <div className='auth-error'>{error || localError}</div>}

					<div className='form-group'>
						<label htmlFor='username'>Username</label>
						<input
							id='username'
							type='text'
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							placeholder='johndoe'
							required
							minLength={3}
							disabled={loading}
						/>
					</div>

					<div className='form-group'>
						<label htmlFor='email'>Email</label>
						<input
							id='email'
							type='email'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder='your@email.com'
							required
							disabled={loading}
						/>
					</div>

					<div className='form-group'>
						<label htmlFor='password'>Password</label>
						<input
							id='password'
							type='password'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder='At least 6 characters'
							required
							minLength={6}
							disabled={loading}
						/>
					</div>

					<div className='form-group'>
						<label htmlFor='confirmPassword'>Confirm Password</label>
						<input
							id='confirmPassword'
							type='password'
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							placeholder='Re-enter your password'
							required
							minLength={6}
							disabled={loading}
						/>
					</div>

					<button type='submit' className='auth-button' disabled={loading}>
						{loading ? 'Creating account...' : 'Sign Up'}
					</button>
				</form>

				<div className='auth-footer'>
					Already have an account?{' '}
					<button onClick={onBackToLogin} className='auth-link'>
						Sign in
					</button>
				</div>
			</div>
		</div>
	);
};
