import type { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';
import { useContext } from 'react';
import { createContext } from 'react';
import { useRef } from 'react';
import React from 'react';
import styled from 'styled-components';

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
  z-index: 10;
`;

export const PortalProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [dimensions, setDimensions] = useState<DOMRect>();
  const portalRef = useRef<HTMLDivElement>(null);

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
