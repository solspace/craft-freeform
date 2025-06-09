import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';

import type { PushState } from '../../template.modal';

import type { Address } from './components/address';
import type { Attachment } from './components/attachments';

type Result = {
  to: string;
  subject: string;
  from: Address | Address[];
  cc?: Address[];
  bcc?: Address[];
  body: string;
  htmlBody?: string;
  attachments?: Attachment[];
};

export const QKPreview = {
  preview: ['notifications', 'templates', 'preview'],
  test: ['notifications', 'templates', 'send-test'],
} as const;

export const usePreviewQuery = (
  state: PushState
): UseQueryResult<Result, Error> => {
  return useQuery({
    enabled: false,
    queryKey: QKPreview.preview,
    queryFn: async () => {
      const response = await axios.post(`/api/templates/preview`, state);

      return response.data;
    },
  });
};

export const useSendTestEmailMutation = (): UseMutationResult<
  void,
  Error,
  PushState
> => {
  return useMutation({
    mutationFn: async (state: PushState) =>
      await axios.post(`/api/templates/send-test`, state),
  });
};
