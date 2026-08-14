import type { Session, User } from '@supabase/supabase-js';

export type AuthStatus = 'initializing' | 'authenticated' | 'unauthenticated' | 'error';

export interface WorkspaceInfo {
  id: string;
  name: string;
  role: string;
  isNew?: boolean;
}

export interface AuthContextValue {
  session: Session | null;
  user: User | null;
  status: AuthStatus;
  error: Error | null;
  signInWithGoogle: (returnTo?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
}

export interface WorkspaceContextValue {
  currentWorkspace: WorkspaceInfo | null;
  workspaceId: string | null;
  isLoading: boolean;
  error: Error | null;
  refetchWorkspace: () => Promise<void>;
}
