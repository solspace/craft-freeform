import React, { useState } from 'react';
import { LoadingText } from '@components/loaders/loading-text/loading-text';
import { ModalFooter, ModalHeader } from '@components/modals/modal.styles';
import type { ModalContainerProps } from '@components/modals/modal.types';
import translate from '@ff-client/utils/translations';

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

export const EditNotificationModal: React.FC<ModalContainerProps> = ({
  data,
  closeModal,
}) => {
  const handleSave = async (): Promise<void> => {
    console.log('saving');
  };

  const [activeTab, setActiveTab] = useState<NotificationTabs>(
    configuration[0].name
  );
  const [state, setState] = useState<NotificationConfiguration>();

  return (
    <Container>
      <ModalHeader>
        <h1>{translate('Some Notification Title Here')}</h1>
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
        {configuration.map((tab) => (
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
                    onChange={(value: string) =>
                      setState((prev) => ({ ...prev, [field.handle]: value }))
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
            loading={false}
            spinner
          >
            {translate('Save')}
          </LoadingText>
        </button>
      </ModalFooter>
    </Container>
  );
};
