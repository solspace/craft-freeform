import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
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

export const QKPreview = ['notifications', 'templates', 'preview'];

export const usePreviewQuery = (
  state: PushState
): UseQueryResult<Result, Error> => {
  return useQuery({
    enabled: false,
    queryKey: QKPreview,
    queryFn: async () => {
      const response = await axios.post(`/api/templates/preview`, state);

      return response.data;
    },
  });
};
