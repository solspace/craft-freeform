import type { FC } from "react";
import { useEffect, useRef } from "react";
import styled from "styled-components";

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
          if (iframe?.contentWindow?.document) {
            const height = iframe.contentWindow.document.body.scrollHeight;
            iframe.style.height = `${height}px`;
            iframe.contentWindow.document.body.style.overflow = "hidden";
          }
        };

        iframe.onload = setHeight;
        setTimeout(setHeight, 50);
      }
    }
  }, [body]);

  return (
    <Iframe
      ref={ref}
      width="100%"
      sandbox="allow-same-origin allow-scripts"
      title="Email Preview"
    />
  );
};

const Iframe = styled.iframe`
  display: block;
  width: 100%;

  overflow: hidden;
  border: none;
`;
