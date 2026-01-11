import { User, AuthCredentials, AuthSession } from '../entities/User';
import { AuthRepository } from '../ports/AuthRepository';
import { SimpleObservable, Observer } from '../ports/Observable';

/**
 * Authentication Use Case
 * This contains the core business logic for authentication
 * It is completely framework-independent
 */
export class AuthUseCase {
  private userObservable = new SimpleObservable<User | null>();
  private currentUser: User | null = null;

  constructor(private repository: AuthRepository) {}

  /**
   * Subscribe to authentication state changes
   */
  subscribeUser(observer: Observer<User | null>): () => void {
    return this.userObservable.subscribe(observer);
  }

  /**
   * Login with credentials
   */
  async login(credentials: AuthCredentials): Promise<AuthSession> {
    // Business rule: Username must not be empty
    if (!credentials.username.trim()) {
      throw new Error('Username cannot be empty');
    }

    // Business rule: Password must be at least 6 characters
    if (credentials.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const session = await this.repository.login(credentials);
    this.currentUser = session.user;
    this.userObservable.notify(this.currentUser);
    return session;
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    await this.repository.logout();
    this.currentUser = null;
    this.userObservable.notify(this.currentUser);
  }

  /**
   * Check authentication status
   */
  async checkAuth(): Promise<void> {
    const isAuth = await this.repository.isAuthenticated();
    if (isAuth) {
      this.currentUser = await this.repository.getCurrentUser();
    } else {
      this.currentUser = null;
    }
    this.userObservable.notify(this.currentUser);
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated (synchronous)
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }
}
