// User repository interface - defines user data access contract
import { User, UserWithPassword, RegisterDTO, UpdateUserDTO } from '../models/User';

export interface IUserRepository {
	getAll(): Promise<User[]>;
	getById(id: string): Promise<User | null>;
	getByEmail(email: string): Promise<UserWithPassword | null>;
	create(data: RegisterDTO): Promise<UserWithPassword>;
	update(data: UpdateUserDTO): Promise<User>;
	delete(id: string): Promise<void>;
	emailExists(email: string): Promise<boolean>;
	usernameExists(username: string): Promise<boolean>;
}
