import { createContext } from 'react';
import type { AuthContextValue, WorkspaceContextValue } from './types';

export const AuthContext = createContext<AuthContextValue | null>(null);
export const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);
