import React from 'react';
import { QKNotifications } from '@ff-client/queries/notifications';
import type { APIError } from '@ff-client/types/api';
import type { NotificationTemplate } from '@ff-client/types/notifications';
import classes from '@ff-client/utils/classes';
import { notifications } from '@ff-client/utils/notifications';
import translate from '@ff-client/utils/translations';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { useNotificationEditModal } from '../../modal/template.modal.hooks';
import type { NotificationSelectHandler } from '../../notification-template';

import { Button, ButtonGroup, Name, TemplateCard } from './item.styles';

type Props = {
  active: boolean;
  template: NotificationTemplate;
  onClick: NotificationSelectHandler;
};

export const Item: React.FC<Props> = ({ active, template, onClick }) => {
  const { id, name } = template;

  const queryClient = useQueryClient();
  const openModal = useNotificationEditModal();

  return (
    <TemplateCard
      className={classes(active ? 'active' : '')}
      onClick={() => onClick(template)}
    >
      <Name title={name}>{name}</Name>

      {!!template.formId && (
        <ButtonGroup>
          <Button
            title={translate('Edit')}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              openModal({ id });

              return false;
            }}
          >
            <i className="fa-solid fa-pencil"></i>
          </Button>
          <Button
            title={translate('Delete')}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              if (
                confirm(
                  translate('Are you sure you want to delete this template?')
                )
              ) {
                axios
                  .post('/api/templates/notifications/delete', {
                    id,
                  })
                  .then(() => {
                    queryClient.invalidateQueries(QKNotifications.templates());
                    queryClient.invalidateQueries(
                      QKNotifications.formTemplates(template.formId)
                    );
                  })
                  .catch((error: APIError) => {
                    const errors = Object.values(error.errors).join(', ');
                    notifications.error(errors);
                  });
              }

              return false;
            }}
          >
            <i className="fa-solid fa-xmark" />
          </Button>
        </ButtonGroup>
      )}
    </TemplateCard>
  );
};
