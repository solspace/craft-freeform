import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { NotificationTemplateGroups } from '@ff-client/queries/notifications';
import {
  useQueryFormNotificationTemplates,
  useQueryNotificationTemplates,
} from '@ff-client/queries/notifications';
import type { NotificationTemplate } from '@ff-client/types/notifications';

type UseNotificationTemplates = (selectedId: string | number) => {
  templates: NotificationTemplateGroups;
  selectedTemplate?: NotificationTemplate;
  isFetching: boolean;
};

export const useNotificationTemplates: UseNotificationTemplates = (
  selectedId
) => {
  const isDb = typeof selectedId === 'number';
  const isFile = typeof selectedId === 'string';

  const { formId } = useParams();

  const { data, isFetching } = useQueryNotificationTemplates();
  const { data: formTemplates, isFetching: isFetchingFormTemplates } =
    useQueryFormNotificationTemplates(Number(formId));

  const [selectedTemplate, setSelectedTemplate] =
    useState<NotificationTemplate>();
  const [templates, setTemplates] = useState<NotificationTemplateGroups>({
    database: [],
    files: [],
  });

  useEffect(() => {
    if (data && !isFetching) {
      setTemplates((prev) => ({
        ...prev,
        database: data.templates.database,
        files: data.templates.files,
      }));
    }
  }, [data, isFetching]);

  useEffect(() => {
    if (formTemplates && !isFetchingFormTemplates) {
      setTemplates((prev) => ({
        ...prev,
        form: formTemplates,
      }));
    }
  }, [formTemplates, isFetchingFormTemplates]);

  useEffect(() => {
    if (isDb) {
      let dbTemplate = templates?.database?.find((t) => t.id === selectedId);
      if (!dbTemplate) {
        dbTemplate = templates?.form?.find((t) => t.id === selectedId);
      }

      setSelectedTemplate(dbTemplate);
    } else if (isFile) {
      const fileTemplate = templates?.files?.find((t) => t.id === selectedId);
      setSelectedTemplate(fileTemplate);
    }
  }, [selectedId, templates]);

  return {
    templates,
    isFetching,
    selectedTemplate,
  };
};
