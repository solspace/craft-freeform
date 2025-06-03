import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LoadingText } from '@components/loaders/loading-text/loading-text';
import { ModalFooter, ModalHeader } from '@components/modals/modal.styles';
import type { ModalContainerProps } from '@components/modals/modal.types';
import { QKNotifications } from '@ff-client/queries/notifications';
import type { GenericValue } from '@ff-client/types/properties';
import translate from '@ff-client/utils/translations';
import { useQueryClient } from '@tanstack/react-query';

import type { NotificationEditModalOptions } from './template.modal.hooks';
import {
  QKNotificationTemplates,
  useNotificationTemplateMutation,
  useQueryNotificationTemplate,
} from './template.modal.queries';
import {
  Container,
  ModalContent,
  Row,
  TabContent,
  TabList,
  TabListItem,
} from './template.modal.styles';
import type { NotificationTabs } from './template.modal.types';
import {
  configuration,
  type NotificationConfiguration,
} from './template.modal.types';

const firstTab = configuration[0].name;

type PushState = NotificationConfiguration & {
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

  const handleSave = async (): Promise<void> => {
    await mutation.mutate(state, {
      onSuccess: (response: { id: string | number }) => {
        setState((prev) => ({
          ...prev,
          id: response.id,
        }));

        queryClient.invalidateQueries(QKNotificationTemplates.one(id));
        queryClient.invalidateQueries(QKNotifications.templates());
        queryClient.invalidateQueries(
          QKNotifications.formTemplates(Number(formId))
        );

        closeModal();

        if (typeof data?.onSuccess === 'function') {
          data.onSuccess(response.id);
        }
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
            loadingText={translate('Loading...')}
            loading={isLoading}
            spinner
          >
            {template?.name || 'New Template'}
          </LoadingText>
        </h1>
      </ModalHeader>

      <TabList>
        {configuration.map((tab) => (
          <TabListItem
            key={tab.name}
            className={tab.name === activeTab && 'active'}
            onClick={() => setActiveTab(tab.name)}
          >
            {tab.name}
          </TabListItem>
        ))}
      </TabList>

      <ModalContent>
        {!isLoading &&
          template !== undefined &&
          configuration.map((tab) => (
            <TabContent
              key={tab.name}
              className={tab.name === activeTab && 'active'}
            >
              {tab.rows.map((row, index) => (
                <Row key={index}>
                  {row.map((field) => (
                    <field.type
                      key={field.handle}
                      {...field}
                      value={state?.[field.handle] || ''}
                      onChange={(value: GenericValue) => {
                        setState((prev) => ({
                          ...prev,
                          [field.handle]: value,
                        }));

                        if ('updateState' in field && field.updateState) {
                          setState((prev) => field.updateState(value, prev));
                        }
                      }}
                    />
                  ))}
                </Row>
              ))}
            </TabContent>
          ))}
      </ModalContent>

      <ModalFooter>
        <button className="btn cancel" onClick={closeModal}>
          {translate('Close')}
        </button>
        <button className="btn submit" onClick={handleSave}>
          <LoadingText
            loadingText={translate('Saving')}
            loading={mutation.isLoading}
            spinner
          >
            {translate('Save')}
          </LoadingText>
        </button>
      </ModalFooter>
    </Container>
  );
};
