import type React from "react";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import styled from "styled-components";

type PortalContextType = {
  element?: HTMLDivElement;
  dimensions?: DOMRect;
};

export const PortalContext = createContext<PortalContextType>({});

export const usePortal = (): PortalContextType => {
  return useContext(PortalContext);
};

const PortalElement = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  z-index: 1005;
`;

export const PortalProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [dimensions, setDimensions] = useState<DOMRect>();
  const portalRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: This effect should only run when the portalRef changes, which is unlikely.
  useEffect(() => {
    if (portalRef.current) {
      setDimensions(portalRef.current.getBoundingClientRect());
    }
  }, [portalRef.current]);

  return (
    <PortalContext.Provider value={{ element: portalRef.current, dimensions }}>
      <PortalElement id="pop-up-portal" ref={portalRef} />
      {children}
    </PortalContext.Provider>
  );
};
