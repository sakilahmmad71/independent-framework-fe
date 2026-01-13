// User model and related DTOs
export interface User {
	id: string;
	email: string;
	username: string;
	createdAt: Date;
}

export interface UserWithPassword extends User {
	passwordHash: string;
}

export type RegisterDTO = {
	email: string;
	username: string;
	password: string;
};

export type LoginDTO = {
	email: string;
	password: string;
};

export type AuthSession = {
	user: User;
	token: string;
	expiresAt: Date;
};

export type UpdateUserDTO = {
	id: string;
	email?: string;
	username?: string;
};

export type ChangePasswordDTO = {
	userId: string;
	currentPassword: string;
	newPassword: string;
};
