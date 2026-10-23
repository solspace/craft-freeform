import translate from "@ff-client/utils/translations";
import { useState } from "react";
import Skeleton from "react-loading-skeleton";
import styled from "styled-components";

const Content = styled.div`
  position: relative;
  display: flex;
  flex: 1 1 0;
  min-height: 0;
`;
const Frame = styled.iframe<{ $loaded: boolean }>`
  display: block;
  width: 100%;
  flex: 1 1 0;
  min-height: 0;
  border: 0;
  visibility: ${({ $loaded }) => ($loaded ? "visible" : "hidden")};
`;
const Placeholder = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 4px 24px 16px;
  overflow: hidden;
  pointer-events: none;
  .widget-loading-summary { display: flex; justify-content: space-between; gap: 24px; }
  .widget-loading-lines { line-height: 24px; }
  .widget-loading-chart { margin-top: auto; line-height: 0; }
`;

// The parent keys this component by widget/site/revision so a replacement frame
// starts loading immediately, without briefly revealing the previous content.
export const WidgetFrame = ({ src, title }: { src: string; title: string }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <Content aria-busy={!loaded}>
      {!loaded && (
        <Placeholder role="status" aria-label={translate("Loading...")}>
          <div className="widget-loading-summary" aria-hidden="true">
            <Skeleton height={8} width={90} />
            <Skeleton height={8} width={60} />
          </div>
          <div className="widget-loading-lines" aria-hidden="true">
            <Skeleton height={8} width="85%" />
            <Skeleton height={8} width="65%" />
            <Skeleton height={8} width="75%" />
          </div>
          <div className="widget-loading-chart" aria-hidden="true">
            <Skeleton height={32} />
          </div>
        </Placeholder>
      )}
      <Frame
        data-freeform-widget-frame
        data-no-drag
        title={title}
        src={src}
        $loaded={loaded}
        aria-hidden={!loaded}
        tabIndex={loaded ? undefined : -1}
        onLoad={(event) => {
          // Some browsers emit an initial load for the iframe's blank document.
          if (event.currentTarget.contentDocument?.URL === "about:blank")
            return;
          setLoaded(true);
        }}
      />
    </Content>
  );
};
