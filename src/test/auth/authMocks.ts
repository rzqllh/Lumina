import { vi } from 'vitest';
import type { Session, User, AuthError } from '@supabase/supabase-js';

export const mockUser: User = {
  id: 'usr_test_123',
  app_metadata: {},
  user_metadata: {
    full_name: 'Alex Visuals',
  },
  aud: 'authenticated',
  created_at: '2026-08-14T00:00:00Z',
  email: 'alex@example.com',
};

export const mockSession: Session = {
  access_token: 'mock_jwt_token',
  refresh_token: 'mock_refresh_token',
  expires_in: 3600,
  token_type: 'bearer',
  user: mockUser,
};

export const mockWorkspaceRow = {
  workspace_id: 'ws_test_456',
  workspace_name: "Alex Visuals's Workspace",
  member_role: 'owner',
  is_new: true,
};

export function mockPostgrestSuccess<T>(data: T) {
  return {
    data,
    error: null,
    count: null,
    status: 200,
    statusText: 'OK',
  } as never;
}

export function mockPostgrestError(message: string) {
  return {
    data: null,
    error: {
      message,
      name: 'PostgrestError',
      hint: '',
      details: '',
      code: '500',
    },
    count: null,
    status: 500,
    statusText: 'Internal Server Error',
  } as never;
}

export function mockAuthError(message: string, status = 400): AuthError {
  return {
    name: 'AuthApiError',
    message,
    status,
    code: 'auth_error',
    __isAuthError: true,
  } as unknown as AuthError;
}

export function createSupabaseAuthMock(initialSession: Session | null = null) {
  let currentSession = initialSession;
  let authStateCallback: ((event: string, session: Session | null) => void) | null = null;

  const mockGetSession = vi.fn().mockImplementation(async () => ({
    data: { session: currentSession },
    error: null,
  }));

  const mockOnAuthStateChange = vi.fn().mockImplementation((callback) => {
    authStateCallback = callback;
    return {
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    };
  });

  const mockSignInWithOAuth = vi.fn().mockImplementation(async () => ({
    data: { provider: 'google', url: 'https://accounts.google.com/o/oauth2/v2/auth' },
    error: null,
  }));

  const mockSignOut = vi.fn().mockImplementation(async () => {
    currentSession = null;
    if (authStateCallback) {
      authStateCallback('SIGNED_OUT', null);
    }
    return { error: null };
  });

  const mockRpc = vi.fn().mockImplementation(async (fnName: string) => {
    if (fnName === 'bootstrap_personal_workspace') {
      if (!currentSession) {
        return mockPostgrestError('Authentication required');
      }
      return mockPostgrestSuccess([mockWorkspaceRow]);
    }
    return mockPostgrestSuccess(null);
  });

  return {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
      signInWithOAuth: mockSignInWithOAuth,
      signOut: mockSignOut,
    },
    rpc: mockRpc,
    triggerAuthStateChange: (event: string, session: Session | null) => {
      currentSession = session;
      if (authStateCallback) {
        authStateCallback(event, session);
      }
    },
  };
}
