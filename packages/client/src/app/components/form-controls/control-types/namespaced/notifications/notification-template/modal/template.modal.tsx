import { LoadingText } from "@components/loaders/loading-text/loading-text";
import { ModalFooter, ModalHeader } from "@components/modals/modal.styles";
import type { ModalContainerProps } from "@components/modals/modal.types";
import config from "@config/freeform/freeform.config";
import { QKNotifications } from "@ff-client/queries/notifications";
import type { APIError } from "@ff-client/types/api";
import type { GenericValue } from "@ff-client/types/properties";
import classes from "@ff-client/utils/classes";
import { objectHasAnyKey } from "@ff-client/utils/comparison";
import translate from "@ff-client/utils/translations";
import { useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { TemplatePreview } from "./inputs/preview/preview";
import { QKPreview } from "./inputs/preview/preview.queries";
import type { NotificationEditModalOptions } from "./template.modal.hooks";
import {
  QKNotificationTemplates,
  useNotificationTemplateMutation,
  useQueryNotificationTemplate,
} from "./template.modal.queries";
import {
  Container,
  ModalContent,
  Row,
  TabContent,
  TabList,
  TabListItem,
} from "./template.modal.styles";
import type { NotificationTabs } from "./template.modal.types";
import {
  configuration,
  type NotificationConfiguration,
} from "./template.modal.types";

const firstTab = configuration[0].name;

export type PushState = NotificationConfiguration & {
  formId?: number;
};

export const EditNotificationModal: React.FC<
  ModalContainerProps<NotificationEditModalOptions>
> = ({ data, closeModal }) => {
  const { formId } = useParams();

  const id = data?.id;
  // const type = data?.type;

  const queryClient = useQueryClient();
  const { data: template, isLoading } = useQueryNotificationTemplate(id);
  const mutation = useNotificationTemplateMutation(formId && Number(formId));

  const [activeTab, setActiveTab] = useState<NotificationTabs>(firstTab);
  const [state, setState] = useState<PushState>();
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    return () => {
      setState(undefined);
      setErrors({});
      queryClient.removeQueries({ queryKey: QKPreview.preview });
    };
  }, [queryClient.removeQueries]);

  const handleSave = async (): Promise<void> => {
    await mutation.mutate(state, {
      onSuccess: (response: { id: string | number }) => {
        setState((prev) => ({
          ...prev,
          id: response.id,
        }));

        queryClient.invalidateQueries({
          queryKey: QKNotificationTemplates.one(id),
        });
        queryClient.invalidateQueries({
          queryKey: QKNotifications.templates(),
        });
        queryClient.invalidateQueries({
          queryKey: QKNotifications.formTemplates(Number(formId)),
        });

        closeModal();

        if (typeof data?.onSuccess === "function") {
          data.onSuccess(response.id);
        }
      },
      onError: (err: APIError) => {
        setErrors(err.errors.notification);
      },
    });
  };

  useEffect(() => {
    if (template) {
      setState(template);
    }
  }, [template]);

  return (
    <Container>
      <ModalHeader>
        <h1>
          <LoadingText
            loadingText={translate("Loading...")}
            loading={isLoading}
            spinner
          >
            {template?.name || "New Template"}
          </LoadingText>
        </h1>
      </ModalHeader>

      <TabList>
        {configuration.map((tab) => (
          <TabListItem
            key={tab.name}
            className={classes(
              tab.name === activeTab && "active",
              objectHasAnyKey(
                errors,
                tab.rows.flatMap((row) => row.map((field) => field.handle)),
              ) && "errors",
            )}
            onClick={() => setActiveTab(tab.name)}
          >
            <span>{tab.name}</span>
          </TabListItem>
        ))}
      </TabList>

      <ModalContent>
        {!isLoading &&
          template !== undefined &&
          configuration.map((tab) => (
            <TabContent
              key={tab.name}
              className={classes(tab.name === activeTab && "active")}
            >
              {tab.rows.map((row, index) => (
                <Row key={index}>
                  {row.map((field) => {
                    if ("minEdition" in field && field.minEdition) {
                      if (!config.editions.isAtLeast(field.minEdition)) {
                        return null;
                      }
                    }

                    let context: Record<string, unknown> | undefined;
                    if (field.type === TemplatePreview) {
                      context = {
                        ...state,
                        formId: formId ? Number(formId) : undefined,
                      };
                    }

                    return (
                      <field.type
                        key={field.handle}
                        {...field}
                        context={context}
                        inView={tab.name === activeTab}
                        value={state?.[field.handle] || ""}
                        errors={errors?.[field.handle]}
                        onChange={(value: GenericValue) => {
                          if ("onChange" in field && field.onChange) {
                            value = field.onChange(value);
                          }

                          setState((prev) => ({
                            ...prev,
                            [field.handle]: value,
                          }));

                          if ("updateState" in field && field.updateState) {
                            setState((prev) => field.updateState(value, prev));
                          }
                        }}
                      />
                    );
                  })}
                </Row>
              ))}
            </TabContent>
          ))}
      </ModalContent>

      <ModalFooter>
        <button type="button" className="btn cancel" onClick={closeModal}>
          {translate("Close")}
        </button>
        <button type="button" className="btn submit" onClick={handleSave}>
          <LoadingText
            loadingText={translate('Saving...')}
            loading={mutation.isPending}
            spinner
          >
            {translate("Save")}
          </LoadingText>
        </button>
      </ModalFooter>
    </Container>
  );
};
