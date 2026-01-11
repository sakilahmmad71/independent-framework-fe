import { AuthUseCase } from '../usecases/AuthUseCase';
import { InMemoryAuthRepository } from '../../adapters/InMemoryAuthRepository';

describe('AuthUseCase', () => {
  let authUseCase: AuthUseCase;
  let repository: InMemoryAuthRepository;

  beforeEach(() => {
    repository = new InMemoryAuthRepository();
    authUseCase = new AuthUseCase(repository);
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const credentials = { username: 'demo', password: 'password' };
      const session = await authUseCase.login(credentials);

      expect(session.user.username).toBe('demo');
      expect(session.token).toBeDefined();
      expect(authUseCase.isAuthenticated()).toBe(true);
    });

    it('should reject empty username', async () => {
      const credentials = { username: '', password: 'password' };
      await expect(authUseCase.login(credentials)).rejects.toThrow('Username cannot be empty');
    });

    it('should reject short password', async () => {
      const credentials = { username: 'demo', password: '123' };
      await expect(authUseCase.login(credentials)).rejects.toThrow('Password must be at least 6 characters');
    });

    it('should notify subscribers on login', async () => {
      const observer = jest.fn();
      authUseCase.subscribeUser(observer);

      await authUseCase.login({ username: 'demo', password: 'password' });
      
      expect(observer).toHaveBeenCalledWith(expect.objectContaining({
        username: 'demo'
      }));
    });
  });

  describe('logout', () => {
    it('should logout user', async () => {
      await authUseCase.login({ username: 'demo', password: 'password' });
      expect(authUseCase.isAuthenticated()).toBe(true);

      await authUseCase.logout();
      expect(authUseCase.isAuthenticated()).toBe(false);
      expect(authUseCase.getCurrentUser()).toBeNull();
    });

    it('should notify subscribers on logout', async () => {
      await authUseCase.login({ username: 'demo', password: 'password' });

      const observer = jest.fn();
      authUseCase.subscribeUser(observer);

      await authUseCase.logout();
      expect(observer).toHaveBeenCalledWith(null);
    });
  });

  describe('getCurrentUser', () => {
    it('should return null when not authenticated', () => {
      expect(authUseCase.getCurrentUser()).toBeNull();
    });

    it('should return user when authenticated', async () => {
      await authUseCase.login({ username: 'demo', password: 'password' });
      const user = authUseCase.getCurrentUser();
      
      expect(user).not.toBeNull();
      expect(user?.username).toBe('demo');
    });
  });
});
