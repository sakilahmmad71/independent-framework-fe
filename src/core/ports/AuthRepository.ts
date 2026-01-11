import { User, AuthCredentials, AuthSession } from '../entities/User';

/**
 * Repository interface for User/Auth operations
 * This is a port that can be implemented by different adapters
 */
export interface AuthRepository {
  /**
   * Login with credentials
   */
  login(credentials: AuthCredentials): Promise<AuthSession>;

  /**
   * Logout current session
   */
  logout(): Promise<void>;

  /**
   * Get current authenticated user
   */
  getCurrentUser(): Promise<User | null>;

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): Promise<boolean>;
}
