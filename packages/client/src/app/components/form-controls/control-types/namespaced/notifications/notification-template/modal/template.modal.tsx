import React, { useEffect, useState } from 'react';
import { LoadingText } from '@components/loaders/loading-text/loading-text';
import { ModalFooter, ModalHeader } from '@components/modals/modal.styles';
import type { ModalContainerProps } from '@components/modals/modal.types';
import type { GenericValue } from '@ff-client/types/properties';
import translate from '@ff-client/utils/translations';

import {
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

export const EditNotificationModal: React.FC<ModalContainerProps> = ({
  data,
  closeModal,
}) => {
  const { id } = data;
  const { data: template, isLoading } = useQueryNotificationTemplate(id);
  const mutation = useNotificationTemplateMutation();

  const [activeTab, setActiveTab] = useState<NotificationTabs>(firstTab);
  const [state, setState] = useState<NotificationConfiguration>();

  const handleSave = async (): Promise<void> => {
    await mutation.mutate(state);
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
          template.id &&
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
                      onChange={(value: GenericValue) =>
                        setState((prev) => ({
                          ...prev,
                          [field.handle]: value,
                        }))
                      }
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
