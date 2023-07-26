import React from 'react';
import { useSpring } from 'react-spring';
import { colors } from '@ff-client/styles/variables';
import type { NotificationTemplate } from '@ff-client/types/notifications';
import classes from '@ff-client/utils/classes';

import SubjectIcon from '../../icons/subject.svg';
import type { NotificationSelectHandler } from '../../notification-template';

import { Id, Name, Subject, TemplateCard } from './item.styles';

type Props = {
  active: boolean;
  template: NotificationTemplate;
  onClick: NotificationSelectHandler;
};

export const Item: React.FC<Props> = ({ active, template, onClick }) => {
  const { id, name, description, subject } = template;

  const [hover, setHover] = React.useState(false);

  const cardAnimations = useSpring({
    // transform: hover ? 'scale(1.08) rotate(1deg)' : 'scale(1) rotate(0deg)',
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
      <Name>{name}</Name>
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
