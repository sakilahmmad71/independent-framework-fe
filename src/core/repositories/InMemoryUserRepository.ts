// In-memory implementation of user repository
import { User, UserWithPassword, RegisterDTO, UpdateUserDTO } from '../models/User';
import { IUserRepository } from './IUserRepository';

export class InMemoryUserRepository implements IUserRepository {
	private users: UserWithPassword[] = [];

	async getAll(): Promise<User[]> {
		// Return users without password hashes
		return this.users.map(({ passwordHash, ...user }) => user);
	}

	async getById(id: string): Promise<User | null> {
		const user = this.users.find((u) => u.id === id);
		if (!user) return null;

		const { passwordHash, ...userWithoutPassword } = user;
		return userWithoutPassword;
	}

	async getByEmail(email: string): Promise<UserWithPassword | null> {
		return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
	}

	async create(data: RegisterDTO): Promise<UserWithPassword> {
		const newUser: UserWithPassword = {
			id: crypto.randomUUID(),
			email: data.email.toLowerCase(),
			username: data.username,
			passwordHash: data.password, // In real app, this would be hashed
			createdAt: new Date(),
		};

		this.users.push(newUser);
		return newUser;
	}

	async update(data: UpdateUserDTO): Promise<User> {
		const index = this.users.findIndex((u) => u.id === data.id);
		if (index === -1) {
			throw new Error(`User with id ${data.id} not found`);
		}

		this.users[index] = {
			...this.users[index],
			...(data.email !== undefined && { email: data.email.toLowerCase() }),
			...(data.username !== undefined && { username: data.username }),
		};

		const { passwordHash, ...userWithoutPassword } = this.users[index];
		return userWithoutPassword;
	}

	async delete(id: string): Promise<void> {
		const index = this.users.findIndex((u) => u.id === id);
		if (index === -1) {
			throw new Error(`User with id ${id} not found`);
		}
		this.users.splice(index, 1);
	}

	async emailExists(email: string): Promise<boolean> {
		return this.users.some((u) => u.email.toLowerCase() === email.toLowerCase());
	}

	async usernameExists(username: string): Promise<boolean> {
		return this.users.some((u) => u.username.toLowerCase() === username.toLowerCase());
	}
}
