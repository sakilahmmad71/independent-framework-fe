// Authentication use cases - business logic for auth operations
import { IUserRepository } from '../repositories/IUserRepository';
import { LoginDTO, RegisterDTO, AuthSession, User, ChangePasswordDTO } from '../models/User';

export class AuthUseCases {
	private sessions: Map<string, AuthSession> = new Map();

	constructor(private userRepository: IUserRepository) {}

	async register(data: RegisterDTO): Promise<AuthSession> {
		// Validation
		if (!data.email || !data.email.includes('@')) {
			throw new Error('Invalid email address');
		}

		if (!data.username || data.username.length < 3) {
			throw new Error('Username must be at least 3 characters');
		}

		if (!data.password || data.password.length < 6) {
			throw new Error('Password must be at least 6 characters');
		}

		// Check if email already exists
		if (await this.userRepository.emailExists(data.email)) {
			throw new Error('Email already registered');
		}

		// Check if username already exists
		if (await this.userRepository.usernameExists(data.username)) {
			throw new Error('Username already taken');
		}

		// Create user
		const userWithPassword = await this.userRepository.create(data);
		const { passwordHash, ...user } = userWithPassword;

		// Create session
		const session = this.createSession(user);
		this.sessions.set(session.token, session);

		return session;
	}

	async login(data: LoginDTO): Promise<AuthSession> {
		// Validation
		if (!data.email || !data.password) {
			throw new Error('Email and password are required');
		}

		// Get user with password
		const userWithPassword = await this.userRepository.getByEmail(data.email);
		if (!userWithPassword) {
			throw new Error('Invalid email or password');
		}

		// Verify password (in real app, use bcrypt.compare)
		if (userWithPassword.passwordHash !== data.password) {
			throw new Error('Invalid email or password');
		}

		const { passwordHash, ...user } = userWithPassword;

		// Create session
		const session = this.createSession(user);
		this.sessions.set(session.token, session);

		return session;
	}

	async logout(token: string): Promise<void> {
		this.sessions.delete(token);
	}

	async validateSession(token: string): Promise<User | null> {
		const session = this.sessions.get(token);

		if (!session) {
			return null;
		}

		// Check if session expired
		if (session.expiresAt < new Date()) {
			this.sessions.delete(token);
			return null;
		}

		return session.user;
	}

	async getCurrentUser(token: string): Promise<User | null> {
		return this.validateSession(token);
	}

	async changePassword(token: string, data: ChangePasswordDTO): Promise<void> {
		// Validate session
		const user = await this.validateSession(token);
		if (!user || user.id !== data.userId) {
			throw new Error('Unauthorized');
		}

		// Validation
		if (!data.currentPassword || !data.newPassword) {
			throw new Error('Current password and new password are required');
		}

		if (data.newPassword.length < 6) {
			throw new Error('New password must be at least 6 characters');
		}

		// Get user with password
		const userWithPassword = await this.userRepository.getByEmail(user.email);
		if (!userWithPassword) {
			throw new Error('User not found');
		}

		// Verify current password
		if (userWithPassword.passwordHash !== data.currentPassword) {
			throw new Error('Current password is incorrect');
		}

		// Update password (in real app, hash the new password)
		const updatedUser = { ...userWithPassword, passwordHash: data.newPassword };
		// Note: This is simplified. In a real app, you'd have a separate method for password updates
	}

	async refreshSession(token: string): Promise<AuthSession> {
		const user = await this.validateSession(token);
		if (!user) {
			throw new Error('Invalid or expired session');
		}

		// Delete old session
		this.sessions.delete(token);

		// Create new session
		const newSession = this.createSession(user);
		this.sessions.set(newSession.token, newSession);

		return newSession;
	}

	private createSession(user: User): AuthSession {
		const token = crypto.randomUUID();
		const expiresAt = new Date();
		expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour session

		return {
			user,
			token,
			expiresAt,
		};
	}

	// Helper method to check if a user is authenticated
	isAuthenticated(token: string | null): boolean {
		if (!token) return false;
		const session = this.sessions.get(token);
		if (!session) return false;
		return session.expiresAt > new Date();
	}
}
