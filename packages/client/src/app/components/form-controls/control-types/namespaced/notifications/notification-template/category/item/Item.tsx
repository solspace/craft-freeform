import React from 'react';
import { useSpring } from 'react-spring';
import { colors } from '@ff-client/styles/variables';
import type { NotificationTemplate } from '@ff-client/types/notifications';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';

import EditIcon from '../../icons/edit.svg';
import SubjectIcon from '../../icons/subject.svg';
import { useNotificationEditModal } from '../../modal/template.modal.hooks';
import type { NotificationSelectHandler } from '../../notification-template';

import { EditButton, Id, Name, Subject, TemplateCard } from './item.styles';

type Props = {
  active: boolean;
  template: NotificationTemplate;
  onClick: NotificationSelectHandler;
};

export const Item: React.FC<Props> = ({ active, template, onClick }) => {
  const { id, name, description, subject } = template;

  const [hover, setHover] = React.useState(false);
  const openModal = useNotificationEditModal();

  const cardAnimations = useSpring({
    borderColor: hover ? colors.gray300 : colors.gray200,
    background: active ? colors.gray500 : colors.white,
    color: active ? colors.white : colors.gray300,
    config: {
      tension: 500,
    },
  });

  return (
    <TemplateCard
      className={classes(active ? 'is-active' : '')}
      style={cardAnimations}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onClick(template)}
    >
      <Name>
        {name}
        <EditButton
          title={translate('Edit')}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            openModal({ id });

            return false;
          }}
        >
          <EditIcon />
        </EditButton>
      </Name>
      <Id className="code">
        {typeof id === 'number' && 'ID: '}
        {id}
      </Id>
      <Subject>
        <SubjectIcon />
        {description || subject}
      </Subject>
    </TemplateCard>
  );
};
