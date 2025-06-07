import type { FC } from 'react';
import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

type Props = {
  body: string;
};

export const IframeBlock: FC<Props> = ({ body }) => {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = ref.current;
    if (iframe) {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(body);
        doc.close();

        const setHeight = (): void => {
          if (iframe && iframe.contentWindow && iframe.contentWindow.document) {
            const height = iframe.contentWindow.document.body.scrollHeight;
            iframe.style.height = `${height}px`;
          }
        };

        iframe.onload = setHeight;
        setTimeout(setHeight, 50);
      }
    }
  }, [body]);

  return <Iframe ref={ref} sandbox="allow-same-origin" title="Email Preview" />;
};

const Iframe = styled.iframe`
  display: block;
  width: 100%;

  border: none;
`;
