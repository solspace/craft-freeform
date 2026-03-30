import type { NotificationTemplateGroups } from "@ff-client/queries/notifications";
import {
  useQueryFormNotificationTemplates,
  useQueryNotificationTemplates,
} from "@ff-client/queries/notifications";
import type { NotificationTemplate } from "@ff-client/types/notifications";
import type { OptionCollection } from "@ff-client/types/properties";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

type UseNotificationTemplates = (selectedId: string | number) => {
  templates: NotificationTemplateGroups;
  options: OptionCollection;
  selectedTemplate?: NotificationTemplate;
  isFetching: boolean;
};

export const useNotificationTemplates: UseNotificationTemplates = (
  selectedId,
) => {
  const { formId } = useParams();

  const { data, isFetching } = useQueryNotificationTemplates();
  const { data: formTemplates, isFetching: isFetchingFormTemplates } =
    useQueryFormNotificationTemplates(Number(formId));

  const [options, setOptions] = useState<OptionCollection>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<NotificationTemplate>();
  const [templates, setTemplates] = useState<NotificationTemplateGroups>({
    global: [],
  });

  useEffect(() => {
    if (data && !isFetching) {
      setTemplates((prev) => ({
        ...prev,
        global: data.templates,
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
    let selected = templates?.global?.find((t) => t.id === selectedId);
    if (!selected) {
      selected = templates?.form?.find((t) => t.id === selectedId);
    }

    setSelectedTemplate(selected);
  }, [selectedId, templates]);

  useEffect(() => {
    const collection: OptionCollection = [];

    if (templates.form) {
      collection.push({
        label: "Form",
        icon: <i className="fa-solid fa-file" />,
        children: templates.form.map((template) => ({
          label: template.name,
          value: String(template.id),
        })),
      });
    }

    if (templates.global) {
      collection.push({
        label: "Global",
        icon: <i className="fa-solid fa-earth-americas" />,
        children: templates.global.map((template) => ({
          label: template.name,
          value: String(template.id),
        })),
      });
    }

    setOptions(collection);
  }, [templates]);

  return {
    templates,
    options,
    isFetching,
    selectedTemplate,
  };
};
