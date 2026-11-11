import translate from "@ff-client/utils/translations";
import { useCallback, useEffect, useRef, useState } from "react";
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
export const WidgetFrame = ({
  src,
  title,
  onHealthReady,
}: {
  src: string;
  title: string;
  onHealthReady?: (ready: boolean | null) => void;
}) => {
  const [loaded, setLoaded] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const healthTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const reportHealthReady = useCallback(
    (ready: boolean) => {
      clearTimeout(healthTimeout.current);
      onHealthReady?.(ready);
    },
    [onHealthReady],
  );
  useEffect(() => {
    // A widget can be ready before its window load event (for example while a
    // third-party asset is pending). Only accept messages from this frame.
    const receive = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== frameRef.current?.contentWindow ||
        event.data?.type !== "freeform-widget-ready"
      )
        return;
      setLoaded(true);
      reportHealthReady(event.data.healthReady === true);
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [reportHealthReady]);
  useEffect(() => {
    // Hide the fallback while this frame is pending, but restore it if the
    // request fails or stalls. Null distinguishes loading from failure.
    onHealthReady?.(null);
    if (onHealthReady) {
      healthTimeout.current = setTimeout(() => reportHealthReady(false), 15000);
    }
    return () => {
      clearTimeout(healthTimeout.current);
      onHealthReady?.(null);
    };
  }, [onHealthReady, reportHealthReady]);
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
        ref={frameRef}
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
          if (onHealthReady) {
            try {
              reportHealthReady(
                !!event.currentTarget.contentDocument?.querySelector(
                  '[data-freeform-health-ready="true"]',
                ),
              );
            } catch {
              reportHealthReady(false);
            }
          }
        }}
        onError={() => reportHealthReady(false)}
      />
    </Content>
  );
};
