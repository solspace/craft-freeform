import classes from "@ff-client/utils/classes";
import { type FC, useEffect, useMemo, useRef } from "react";
import { wireReadmeCopyButtons } from "./readme.copy";
import { animateReadmeDisclosures } from "./readme.disclosures";
import { renderReadme } from "./readme.render";
import { Content, Instructions, MarkdownWrapper } from "./readme.styles";

import "./markdown.css";

type Props = {
  active?: boolean;
  content: string;
};

export const Readme: FC<Props> = ({ active, content }) => {
  const ref = useRef<HTMLDivElement>(null);
  const html = useMemo(() => renderReadme(content), [content]);
  useEffect(() => {
    if (!html || !ref.current) return;
    const stopAnimation = animateReadmeDisclosures(ref.current);
    const stopCopy = wireReadmeCopyButtons(ref.current);
    return () => {
      stopAnimation();
      stopCopy();
    };
  }, [html]);

  if (!content) {
    return <MarkdownWrapper />;
  }

  return (
    <MarkdownWrapper>
      <Instructions className={classes("markdown-body", active && "active")}>
        <Content
          ref={ref}
          dangerouslySetInnerHTML={{
            __html: html,
          }}
        />
      </Instructions>
    </MarkdownWrapper>
  );
};
