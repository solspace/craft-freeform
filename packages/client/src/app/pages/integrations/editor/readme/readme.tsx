import type { FC } from 'react';
import React from 'react';
import classes from '@ff-client/utils/classes';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

import { Content, Instructions, MarkdownWrapper } from './readme.styles';

import './markdown.css';

type Props = {
  active?: boolean;
  content: string;
};

export const Readme: FC<Props> = ({ active, content }) => {
  const parsedContent = marked.parse(content, { gfm: true, async: false });

  if (!content) {
    return <MarkdownWrapper />;
  }

  return (
    <MarkdownWrapper>
      <Instructions className={classes('markdown-body', active && 'active')}>
        <Content
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(parsedContent),
          }}
        />
      </Instructions>
    </MarkdownWrapper>
  );
};
