import type { ModalType } from "@components/modals/modal.types";
import { useSuspendEscapeStack } from "@ff-client/contexts/escape/escape.context";
import type { GenericValue } from "@ff-client/types/properties";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  content: ModalType;
  data?: GenericValue;
  onClose: () => void;
};

export const NativeSlideout: React.FC<Props> = ({
  content: Content,
  data,
  onClose,
}) => {
  const [host] = useState(() => {
    const element = document.createElement("div");
    element.style.display = "contents";
    return element;
  });
  const panelRef = useRef<Craft.Slideout>();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useSuspendEscapeStack();

  useLayoutEffect(() => {
    // Resolve the global on opening, after Craft's module scripts have loaded.
    const panel = new Craft.Slideout(host, { autoOpen: false });
    panelRef.current = panel;
    let disposed = false;
    panel.on("close", () => {
      if (!disposed) onCloseRef.current();
    });
    panel.open();

    return () => {
      disposed = true;
      // Closing unregisters the native panel stack before destroying the DOM.
      panel.close();
      panel.destroy();
      panelRef.current = undefined;
    };
  }, [host]);

  const close = useCallback(() => panelRef.current?.close(), []);
  return createPortal(<Content closeModal={close} data={data} />, host);
};
