import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { signUp, signIn, signOut, getCurrentUser, onAuthStateChange } from '../../lib/services/authService';
import * as supabaseModule from '../../lib/services/supabaseClient';

// Mock the supabase client
vi.mock('../../lib/services/supabaseClient', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(),
  },
}));

const mockSupabase = supabaseModule.supabase as any;

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signUp', () => {
    it('should successfully sign up a user with valid credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null }),
          }),
        }),
        insert: vi.fn().mockResolvedValue({ error: null }),
      });

      const result = await signUp({ email: 'test@example.com', password: 'password123' });

      expect(result.success).toBe(true);
      expect(result.user?.id).toBe('user-123');
      expect(result.user?.email).toBe('test@example.com');
      expect(result.error).toBeUndefined();
    });

    it('should handle sign up errors from Supabase', async () => {
      const errorMessage = 'User already exists';

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: { message: errorMessage },
      });

      const result = await signUp({ email: 'test@example.com', password: 'password123' });

      expect(result.success).toBe(false);
      expect(result.error).toBe(errorMessage);
      expect(result.user).toBeUndefined();
    });

    it('should handle exceptions during sign up', async () => {
      const errorMessage = 'Network error';

      mockSupabase.auth.signUp.mockRejectedValue(new Error(errorMessage));

      const result = await signUp({ email: 'test@example.com', password: 'password123' });

      expect(result.success).toBe(false);
      expect(result.error).toBe(errorMessage);
    });

    it('should handle non-Error exceptions', async () => {
      mockSupabase.auth.signUp.mockRejectedValue('Unknown error');

      const result = await signUp({ email: 'test@example.com', password: 'password123' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('An error occurred during sign up');
    });

    it('should create user record after successful sign up', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockSelectChain = {
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null }),
        }),
      };

      const mockInsertChain = vi.fn().mockResolvedValue({ error: null });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockSelectChain),
        insert: mockInsertChain,
      });

      await signUp({ email: 'test@example.com', password: 'password123' });

      expect(mockSupabase.from).toHaveBeenCalledWith('users');
      expect(mockInsertChain).toHaveBeenCalled();
    });
  });

  describe('signIn', () => {
    it('should successfully sign in with valid credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await signIn({ email: 'test@example.com', password: 'password123' });

      expect(result.success).toBe(true);
      expect(result.user?.id).toBe('user-123');
      expect(result.user?.email).toBe('test@example.com');
    });

    it('should handle invalid credentials', async () => {
      const errorMessage = 'Invalid login credentials';

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: errorMessage },
      });

      const result = await signIn({ email: 'test@example.com', password: 'wrongpassword' });

      expect(result.success).toBe(false);
      expect(result.error).toBe(errorMessage);
    });

    it('should handle exceptions during sign in', async () => {
      const errorMessage = 'Network error';

      mockSupabase.auth.signInWithPassword.mockRejectedValue(new Error(errorMessage));

      const result = await signIn({ email: 'test@example.com', password: 'password123' });

      expect(result.success).toBe(false);
      expect(result.error).toBe(errorMessage);
    });

    it('should handle non-Error exceptions', async () => {
      mockSupabase.auth.signInWithPassword.mockRejectedValue('Unknown error');

      const result = await signIn({ email: 'test@example.com', password: 'password123' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('An error occurred during sign in');
    });
  });

  describe('signOut', () => {
    it('should successfully sign out', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        error: null,
      });

      const result = await signOut();

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });

    it('should handle sign out errors', async () => {
      const errorMessage = 'Sign out failed';

      mockSupabase.auth.signOut.mockResolvedValue({
        error: { message: errorMessage },
      });

      const result = await signOut();

      expect(result.success).toBe(false);
      expect(result.error).toBe(errorMessage);
    });

    it('should handle exceptions during sign out', async () => {
      const errorMessage = 'Network error';

      mockSupabase.auth.signOut.mockRejectedValue(new Error(errorMessage));

      const result = await signOut();

      expect(result.success).toBe(false);
      expect(result.error).toBe(errorMessage);
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user when logged in', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await getCurrentUser();

      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
      });
    });

    it('should return null when no user is logged in', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await getCurrentUser();

      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Error' },
      });

      const result = await getCurrentUser();

      expect(result).toBeNull();
    });

    it('should handle exceptions and return null', async () => {
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Network error'));

      const result = await getCurrentUser();

      expect(result).toBeNull();
    });

    it('should handle missing email gracefully', async () => {
      const mockUser = {
        id: 'user-123',
        email: null,
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await getCurrentUser();

      expect(result).toEqual({
        id: 'user-123',
        email: '',
      });
    });
  });

  describe('onAuthStateChange', () => {
    it('should call callback when user is logged in', () => {
      const callback = vi.fn();
      const mockSubscription = { unsubscribe: vi.fn() };

      mockSupabase.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: mockSubscription },
      });

      onAuthStateChange(callback);

      // Get the callback that was passed to onAuthStateChange
      const passedCallback = mockSupabase.auth.onAuthStateChange.mock.calls[0][0];

      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
      };

      passedCallback('SIGNED_IN', mockSession);

      expect(callback).toHaveBeenCalledWith({
        id: 'user-123',
        email: 'test@example.com',
      });
    });

    it('should call callback with null when user is logged out', () => {
      const callback = vi.fn();
      const mockSubscription = { unsubscribe: vi.fn() };

      mockSupabase.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: mockSubscription },
      });

      onAuthStateChange(callback);

      const passedCallback = mockSupabase.auth.onAuthStateChange.mock.calls[0][0];

      passedCallback('SIGNED_OUT', null);

      expect(callback).toHaveBeenCalledWith(null);
    });

    it('should return subscription object', () => {
      const mockSubscription = { unsubscribe: vi.fn() };

      mockSupabase.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: mockSubscription },
      });

      const result = onAuthStateChange(() => {});

      expect(result).toBe(mockSubscription);
    });

    it('should handle missing email in session', () => {
      const callback = vi.fn();
      const mockSubscription = { unsubscribe: vi.fn() };

      mockSupabase.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: mockSubscription },
      });

      onAuthStateChange(callback);

      const passedCallback = mockSupabase.auth.onAuthStateChange.mock.calls[0][0];

      const mockSession = {
        user: { id: 'user-123', email: null },
      };

      passedCallback('SIGNED_IN', mockSession);

      expect(callback).toHaveBeenCalledWith({
        id: 'user-123',
        email: '',
      });
    });
  });
});
