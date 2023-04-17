import type { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';
import { useContext } from 'react';
import { createContext } from 'react';
import { useRef } from 'react';
import React from 'react';

type PortalContextType = {
  element?: HTMLDivElement;
  dimensions?: DOMRect;
};

export const PortalContext = createContext<PortalContextType>({});

export const usePortal = (): PortalContextType => {
  return useContext(PortalContext);
};

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
      <div id="pop-up-portal" ref={portalRef} />
      {children}
    </PortalContext.Provider>
  );
};
