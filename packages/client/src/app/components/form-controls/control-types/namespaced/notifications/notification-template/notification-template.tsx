import React from 'react';
import { Control } from '@components/form-controls/control';
import { FormErrorList } from '@components/form-controls/error-list';
import type { ControlType } from '@components/form-controls/types';
import { LoadingText } from '@components/loaders/loading-text/loading-text';
import { useNewNotificationMutation } from '@ff-client/queries/notifications.mutation';
import { spacings } from '@ff-client/styles/variables';
import {
  NotificationTemplate,
  TemplateType,
} from '@ff-client/types/notifications';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';

import { Category } from './category/category';
import ChevronIcon from './icons/chevron.svg';
import {
  useEditorAnimations,
  useSelectionAnimations,
} from './notification-template.animations';
import { useNotificationTemplates } from './notification-template.hooks';
import {
  ButtonRow,
  CategorySelectionWrapper,
  NotificationTemplateSelector,
  SelectedNotification,
} from './notification-template.styles';

export type NotificationSelectHandler = (
  template: NotificationTemplate
) => void;

const NotificationTemplate: React.FC<ControlType<string | number>> = ({
  value,
  property,
  errors,
  updateValue,
}) => {
  const [open, setOpen] = React.useState(false);
  const { templates, isFetching, selectedTemplate } =
    useNotificationTemplates(value);

  const editorAnimations = useEditorAnimations(open);
  const selectionAnimations = useSelectionAnimations(open);

  const mutation = useNewNotificationMutation();

  if (isFetching && !templates) {
    return (
      <Control property={property} errors={errors}>
        <NotificationTemplateSelector style={{ height: 36 }}>
          <SelectedNotification empty>
            <span>
              <LoadingText spinner loading instant>
                {translate('Loading Templates')}
              </LoadingText>
            </span>
            <ChevronIcon />
          </SelectedNotification>
        </NotificationTemplateSelector>
      </Control>
    );
  }

  const handleSelect: NotificationSelectHandler = (template) => {
    mutation.reset();
    updateValue(template.id);
    setOpen(false);
  };

  return (
    <Control property={property} errors={errors}>
      <NotificationTemplateSelector style={editorAnimations}>
        <SelectedNotification
          onClick={() => setOpen(!open)}
          className={classes(open && 'open')}
        >
          <span>{selectedTemplate?.name}</span>
          <ChevronIcon />
        </SelectedNotification>

        <CategorySelectionWrapper style={selectionAnimations}>
          <Category
            value={value}
            category={TemplateType.Database}
            templates={templates.database}
            onClick={handleSelect}
          />
          <Category
            value={value}
            category={TemplateType.File}
            templates={templates.files}
            onClick={handleSelect}
          />
        </CategorySelectionWrapper>

        <ButtonRow style={{ opacity: selectionAnimations.opacity }}>
          <button
            className={classes('btn', mutation.isLoading && 'disabled')}
            disabled={mutation.isLoading}
            onClick={() => {
              mutation.reset();
              setOpen(false);
            }}
          >
            {translate('Close')}
          </button>

          <button
            className={classes(
              'btn',
              'dashed',
              mutation.isLoading && 'disabled'
            )}
            disabled={mutation.isLoading}
            onClick={() => {
              mutation.reset();
              updateValue(undefined);
              setOpen(false);
            }}
          >
            {translate('Clear Choice')}
          </button>

          <button
            className={classes(
              'btn',
              'dashed',
              !mutation.isLoading && 'add',
              !mutation.isLoading && 'icon',
              mutation.isLoading && 'disabled'
            )}
            disabled={mutation.isLoading}
            onClick={() =>
              mutation.mutate(
                { name: 'New Template' },
                {
                  onSuccess: (data) => {
                    const template = data.data;
                    handleSelect(template);
                  },
                }
              )
            }
          >
            {mutation.isLoading && (
              <LoadingText>{translate('Crating a Template')}</LoadingText>
            )}

            {!mutation.isLoading && translate('Add new Template')}
          </button>
        </ButtonRow>

        {mutation.isError && (
          <FormErrorList
            style={{ margin: `0 ${spacings.sm} ${spacings.sm}` }}
            errors={mutation.error.errors as unknown as string[]}
          />
        )}
      </NotificationTemplateSelector>
    </Control>
  );
};

export default NotificationTemplate;
