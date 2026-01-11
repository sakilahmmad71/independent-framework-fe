/**
 * Core domain entity representing a User
 * This is pure business logic with no framework dependencies
 */
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
}

/**
 * User authentication credentials
 */
export interface AuthCredentials {
  username: string;
  password: string;
}

/**
 * Authentication session
 */
export interface AuthSession {
  user: User;
  token: string;
  expiresAt: Date;
}
