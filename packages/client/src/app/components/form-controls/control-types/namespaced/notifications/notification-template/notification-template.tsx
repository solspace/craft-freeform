import React from 'react';
import { ButtonChoices } from '@components/elements/button-choices/button-choices';
import { Control } from '@components/form-controls/control';
import type { ControlType } from '@components/form-controls/types';
import { LoadingText } from '@components/loaders/loading-text/loading-text';
import config from '@config/freeform/freeform.config';
import {
  NotificationTemplate,
  TemplateType,
} from '@ff-client/types/notifications';
import type { NotificationTemplateProperty } from '@ff-client/types/properties';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';

import { Category } from './category/category';
import ChevronIcon from './icons/chevron.svg';
import { useNotificationEditModal } from './modal/template.modal.hooks';
import {
  useEditorAnimations,
  useSelectionAnimations,
} from './notification-template.animations';
import { useNotificationTemplates } from './notification-template.hooks';
import {
  Button,
  ButtonRow,
  CategorySelectionWrapper,
  NotificationTemplateSelector,
  SelectedNotification,
} from './notification-template.styles';

export type NotificationSelectHandler = (
  template: NotificationTemplate
) => void;

const NotificationTemplate: React.FC<
  ControlType<NotificationTemplateProperty>
> = ({ value, property, errors, updateValue }) => {
  const [open, setOpen] = React.useState(false);
  const { templates, isFetching, selectedTemplate } =
    useNotificationTemplates(value);

  const openModal = useNotificationEditModal();

  const {
    templates: { canCreate },
  } = config;

  const selectionAnimations = useSelectionAnimations(open);
  const editorAnimations = useEditorAnimations(
    open,
    templates?.database?.length + templates?.files?.length
  );

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
            category={TemplateType.Form}
            templates={templates.form}
            onClick={handleSelect}
          />
          <Category
            value={value}
            category={TemplateType.Database}
            templates={templates.database}
            collapseByDefault
            onClick={handleSelect}
          />
          <Category
            value={value}
            category={TemplateType.File}
            templates={templates.files}
            collapseByDefault
            onClick={handleSelect}
          />
        </CategorySelectionWrapper>

        <ButtonRow style={{ opacity: selectionAnimations.opacity }}>
          <Button
            className={classes('btn')}
            onClick={() => {
              setOpen(false);
            }}
          >
            {translate('Close')}
          </Button>

          <Button
            className={classes('btn')}
            onClick={() => {
              updateValue(undefined);
              setOpen(false);
            }}
          >
            {translate('Clear choice')}
          </Button>

          {canCreate && (
            <div>
              <ButtonChoices
                label="New Template"
                onClick={() => {
                  openModal({
                    type: 'form',
                    onSuccess: (id: number) => {
                      updateValue(id);
                      setOpen(false);
                    },
                  });
                }}
              />
            </div>
          )}
        </ButtonRow>
      </NotificationTemplateSelector>
    </Control>
  );
};

export default NotificationTemplate;
