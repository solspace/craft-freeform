import type { ModalType } from "@components/modals/modal.types";
import { PortalContext } from "@editor/builder/contexts/portal.context";
import {
  EscapeStackProvider,
  useEscapeStack,
  useSuspendEscapeStack,
} from "@ff-client/contexts/escape/escape.context";
import type { GenericValue } from "@ff-client/types/properties";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  content?: ModalType;
  children?: (close: () => void) => React.ReactNode;
  data?: GenericValue;
  onClose: () => void;
  title?: string;
};

const SlideoutEscapeScope: React.FC<
  React.PropsWithChildren<{ close: () => void }>
> = ({ close, children }) => {
  useEscapeStack(close);
  return <>{children}</>;
};

export const NativeSlideout: React.FC<Props> = ({
  content: Content,
  data,
  onClose,
  children,
  title,
}) => {
  const [host] = useState(() => {
    const element = document.createElement("div");
    element.style.display = "contents";
    return element;
  });
  const panelRef = useRef<Craft.Slideout | undefined>(undefined);
  const [popupHost] = useState(() => {
    const element = document.createElement("div");
    element.className = "freeform-slideout-popups";
    Object.assign(element.style, {
      position: "fixed",
      top: "0",
      left: "0",
      right: "0",
      zIndex: "1005",
    });
    return element;
  });
  const popupContext = useMemo(
    () => ({
      element: popupHost,
      get dimensions() {
        return popupHost.getBoundingClientRect();
      },
    }),
    [popupHost],
  );
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useSuspendEscapeStack();

  useLayoutEffect(() => {
    // Resolve the global on opening, after Craft's module scripts have loaded.
    host.append(popupHost);
    const panel = new Craft.Slideout(host, {
      autoOpen: false,
      closeOnEsc: false,
      containerAttributes: {
        class: "freeform-slideout",
        style: "padding: 0;",
      },
      triggerElement: document.activeElement ?? undefined,
    });
    if (title) panel.$outerContainer[0].setAttribute("aria-label", title);
    panelRef.current = panel;
    let disposed = false;
    let closed = false;
    let closeTimeout: ReturnType<typeof setTimeout>;
    const finishClose = (): void => {
      clearTimeout(closeTimeout);
      if (!disposed && !closed) {
        closed = true;
        onCloseRef.current();
      }
    };
    panel.on("close", finishClose);
    panel.on("beforeClose", () => {
      if (disposed) return;
      // Craft 4 waits for transitionend, which is absent when motion is disabled.
      const styles = getComputedStyle(panel.$container[0]);
      const longestTime = (times: string): number =>
        Math.max(
          0,
          ...times
            .split(",")
            .map(
              (time) =>
                (parseFloat(time) || 0) *
                (time.trim().endsWith("ms") ? 1 : 1000),
            ),
        );
      clearTimeout(closeTimeout);
      closeTimeout = setTimeout(
        finishClose,
        longestTime(styles.transitionDuration) +
          longestTime(styles.transitionDelay) +
          50,
      );
    });
    panel.open();

    return () => {
      disposed = true;
      clearTimeout(closeTimeout);
      // Closing unregisters the native panel stack before destroying the DOM.
      panel.close();
      panel.destroy();
      panelRef.current = undefined;
    };
  }, [host, popupHost, title]);

  const close = useCallback(() => panelRef.current?.close(), []);
  return createPortal(
    <PortalContext.Provider value={popupContext}>
      <EscapeStackProvider>
        <SlideoutEscapeScope close={close}>
          {Content ? (
            <Content closeModal={close} data={data} />
          ) : (
            children?.(close)
          )}
        </SlideoutEscapeScope>
      </EscapeStackProvider>
    </PortalContext.Provider>,
    host,
  );
};
