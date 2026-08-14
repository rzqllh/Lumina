import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useWorkspace } from '@/lib/auth';
import {
  createClient,
  updateClient,
  deleteClient,
  createContact,
  updateContact,
  deleteContact,
} from '../api/clientsApi';
import type {
  CreateClientInput,
  UpdateClientInput,
  CreateContactInput,
  UpdateContactInput,
} from '../types/clientTypes';

export function useClientMutations() {
  const queryClient = useQueryClient();
  const { workspaceId } = useWorkspace();

  const createClientMutation = useMutation({
    mutationFn: (input: Omit<CreateClientInput, 'workspace_id'>) => {
      if (!workspaceId) throw new Error('Workspace required');
      return createClient({ ...input, workspace_id: workspaceId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients', workspaceId] });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: ({ clientId, input }: { clientId: string; input: UpdateClientInput }) => {
      if (!workspaceId) throw new Error('Workspace required');
      return updateClient(workspaceId, clientId, input);
    },
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: ['clients', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['client', workspaceId, clientId] });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: (clientId: string) => {
      if (!workspaceId) throw new Error('Workspace required');
      return deleteClient(workspaceId, clientId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients', workspaceId] });
    },
  });

  const createContactMutation = useMutation({
    mutationFn: (input: Omit<CreateContactInput, 'workspace_id'>) => {
      if (!workspaceId) throw new Error('Workspace required');
      return createContact({ ...input, workspace_id: workspaceId });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['client', workspaceId, variables.client_id] });
      queryClient.invalidateQueries({ queryKey: ['clients', workspaceId] });
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: ({
      clientId,
      contactId,
      input,
    }: {
      clientId: string;
      contactId: string;
      input: UpdateContactInput;
    }) => {
      if (!workspaceId) throw new Error('Workspace required');
      return updateContact(workspaceId, clientId, contactId, input);
    },
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: ['client', workspaceId, clientId] });
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: ({ contactId }: { clientId: string; contactId: string }) => {
      if (!workspaceId) throw new Error('Workspace required');
      return deleteContact(workspaceId, contactId);
    },
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: ['client', workspaceId, clientId] });
      queryClient.invalidateQueries({ queryKey: ['clients', workspaceId] });
    },
  });

  return {
    createClient: createClientMutation,
    updateClient: updateClientMutation,
    deleteClient: deleteClientMutation,
    createContact: createContactMutation,
    updateContact: updateContactMutation,
    deleteContact: deleteContactMutation,
  };
}
