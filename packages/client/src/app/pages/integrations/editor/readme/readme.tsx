import type { FC } from 'react';
import React, { useState } from 'react';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';
import { marked } from 'marked';

import {
  Content,
  Instructions,
  MarkdownCollapser,
  MarkdownToggler,
} from './readme.styles';
import TogglerIcon from './toggler.icon.svg';

import './markdown.css';

type Props = {
  content: string;
};

export const Readme: FC<Props> = ({ content }) => {
  const [open, setOpen] = useState(false);
  const parsedContent = marked.parse(content, { gfm: true });

  return (
    <div>
      <MarkdownToggler
        className={classes(open && 'active')}
        onClick={() => setOpen(!open)}
      >
        <TogglerIcon />
        <span>{translate('Show Setup Instructions')}</span>
      </MarkdownToggler>

      <Instructions className={classes('markdown-body', open && 'active')}>
        <MarkdownCollapser onClick={() => setOpen(!open)}>
          {translate('Collapse')}
        </MarkdownCollapser>

        <Content dangerouslySetInnerHTML={{ __html: parsedContent }} />
      </Instructions>
    </div>
  );
};
