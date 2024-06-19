import type { ComponentPropsWithRef } from 'react';
import React from 'react';
import { colors } from '@ff-client/styles/variables';
import type { Message } from '@ff-client/types/properties';
import classes from '@ff-client/utils/classes';
import styled from 'styled-components';

type Props = ComponentPropsWithRef<'ul'> & {
  messages?: Message[];
};

const MessageListComponent = styled.ul`
  list-style: none;

  margin-top: 5px;

  display: flex;
  flex-direction: column;
  gap: 2px;

  > li {
    &.message-type-warning {
      color: ${colors.warning};
    }

    &.message-type-notice {
      color: ${colors.notice};
    }
  }
`;

export const FormMessageList: React.FC<Props> = ({ messages, ...props }) => {
  if (!messages || !messages.length) {
    return null;
  }

  return (
    <MessageListComponent {...props}>
      {messages.map(({ message, type }, idx) => (
        <li
          key={idx}
          className={classes(`message-type-${type}`, type, 'has-icon')}
        >
          <span className="icon"></span>
          {message}
        </li>
      ))}
    </MessageListComponent>
  );
};
