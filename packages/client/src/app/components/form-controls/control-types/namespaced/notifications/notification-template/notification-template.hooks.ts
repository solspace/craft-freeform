import type { NotificationTemplateGroups } from '@ff-client/queries/notifications';
import { useQueryNotificationTemplates } from '@ff-client/queries/notifications';
import type { NotificationTemplate } from '@ff-client/types/notifications';

type UseNotificationTemplates = (selectedId: string | number) => {
  templates: NotificationTemplateGroups;
  selectedTemplate?: NotificationTemplate;
  isFetching: boolean;
};

export const useNotificationTemplates: UseNotificationTemplates = (
  selectedId
) => {
  const { data, isFetching } = useQueryNotificationTemplates();

  const templates = data?.templates || {
    database: [],
    files: [],
  };

  const isDb = typeof selectedId === 'number';
  const isFile = typeof selectedId === 'string';

  let selectedTemplate: NotificationTemplate;
  if (isDb) {
    selectedTemplate = templates?.database?.find((t) => t.id === selectedId);
  } else if (isFile) {
    selectedTemplate = templates?.files?.find((t) => t.id === selectedId);
  }

  return {
    templates,
    isFetching,
    selectedTemplate,
  };
};
