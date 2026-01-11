import { User, AuthCredentials, AuthSession } from '../core/entities/User';
import { AuthRepository } from '../core/ports/AuthRepository';

/**
 * In-Memory implementation of AuthRepository
 * This adapter can be used with any framework for development/testing
 */
export class InMemoryAuthRepository implements AuthRepository {
  private currentSession: AuthSession | null = null;
  
  // Mock users database
  private users: User[] = [
    {
      id: '1',
      username: 'demo',
      email: 'demo@example.com',
      createdAt: new Date(),
    },
  ];

  async login(credentials: AuthCredentials): Promise<AuthSession> {
    // Mock authentication - in real app, this would call an API
    const user = this.users.find(u => u.username === credentials.username);
    
    if (!user || credentials.password !== 'password') {
      throw new Error('Invalid credentials');
    }

    this.currentSession = {
      user,
      token: 'mock-token-' + Date.now(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    return this.currentSession;
  }

  async logout(): Promise<void> {
    this.currentSession = null;
  }

  async getCurrentUser(): Promise<User | null> {
    return this.currentSession?.user || null;
  }

  async isAuthenticated(): Promise<boolean> {
    if (!this.currentSession) {
      return false;
    }

    // Check if session is expired
    return this.currentSession.expiresAt > new Date();
  }
}
