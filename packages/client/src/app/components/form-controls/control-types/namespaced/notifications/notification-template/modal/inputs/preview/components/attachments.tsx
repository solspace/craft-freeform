import type { FC } from 'react';
import React from 'react';
import { colors } from '@ff-client/styles/variables';
import styled from 'styled-components';

export type Attachment = {
  filename: string;
  mediaType: string;
  size: string;
};

type Props = {
  attachments: Attachment[];
};

export const Attachments: FC<Props> = ({ attachments }) => {
  return (
    <div>
      {attachments.map((attachment, index) => (
        <Item key={index}>
          <i className={`fa-regular fa-file-${attachment.mediaType}`} />
          <span>{attachment.filename}</span>
          <Size>{attachment.size}</Size>
        </Item>
      ))}
    </div>
  );
};

const Item = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Size = styled.span`
  font-weight: 700;
  font-size: 0.8em;
  color: ${colors.gray250};
`;
