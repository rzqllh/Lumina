import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createBriefSection,
  updateBriefSection,
  deleteBriefSection,
  createBriefField,
  updateBriefField,
  deleteBriefField,
  applyBriefTemplateRpc,
  saveBriefAsTemplate,
  generateBriefShareLinkRpc,
  submitPublicBriefRpc,
  applyBriefSubmissionReviewRpc,
} from '../api/briefsApi';
import { briefKeys } from './useBriefs';
import type {
  CreateBriefSectionInput,
  UpdateBriefSectionInput,
  CreateBriefFieldInput,
  UpdateBriefFieldInput,
} from '../types';

export function useCreateBriefSection(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBriefSectionInput) => createBriefSection(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: briefKeys.detail(workspaceId, projectId),
      });
    },
  });
}

export function useUpdateBriefSection(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sectionId, input }: { sectionId: string; input: UpdateBriefSectionInput }) =>
      updateBriefSection(sectionId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: briefKeys.detail(workspaceId, projectId),
      });
    },
  });
}

export function useDeleteBriefSection(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sectionId: string) => deleteBriefSection(sectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: briefKeys.detail(workspaceId, projectId),
      });
    },
  });
}

export function useCreateBriefField(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBriefFieldInput) => createBriefField(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: briefKeys.detail(workspaceId, projectId),
      });
    },
  });
}

export function useUpdateBriefField(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fieldId, input }: { fieldId: string; input: UpdateBriefFieldInput }) =>
      updateBriefField(fieldId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: briefKeys.detail(workspaceId, projectId),
      });
    },
  });
}

export function useDeleteBriefField(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fieldId: string) => deleteBriefField(fieldId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: briefKeys.detail(workspaceId, projectId),
      });
    },
  });
}

export function useApplyBriefTemplate(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ briefId, templateId }: { briefId: string; templateId: string }) =>
      applyBriefTemplateRpc(briefId, templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: briefKeys.detail(workspaceId, projectId),
      });
    },
  });
}

export function useSaveBriefAsTemplate(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      briefId,
      templateName,
      description,
    }: {
      briefId: string;
      templateName: string;
      description?: string;
    }) => saveBriefAsTemplate(workspaceId, briefId, templateName, description),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: briefKeys.templates(workspaceId),
      });
    },
  });
}

export function useGenerateBriefShareLink() {
  return useMutation({
    mutationFn: (projectId: string) => generateBriefShareLinkRpc(projectId),
  });
}

export function useSubmitPublicBrief(token: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (answers: Record<string, unknown>) => submitPublicBriefRpc(token, answers),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: briefKeys.publicIntake(token),
      });
    },
  });
}

export function useApplyBriefSubmissionReview(
  workspaceId: string,
  projectId: string,
  briefId: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      submissionId,
      acceptedFields,
    }: {
      submissionId: string;
      acceptedFields: Array<{ field_id: string; value: unknown }>;
    }) => applyBriefSubmissionReviewRpc(submissionId, acceptedFields),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: briefKeys.detail(workspaceId, projectId),
      });
      queryClient.invalidateQueries({
        queryKey: briefKeys.submissions(briefId),
      });
    },
  });
}
