import type { PropsWithChildren } from 'react';
import { useContext, useEffect, useRef, useState } from 'react';
import React, { createContext } from 'react';

type ZIndexContext = {
  register: () => number;
  unregister: () => void;
};

const Context = createContext<ZIndexContext>({
  register: () => 1000,
  unregister: () => {},
});

export const ZIndexContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const index = useRef(1000);

  const register = (): number => {
    index.current -= 1;

    return index.current;
  };

  const unregister = (): void => {
    index.current += 1;
  };

  return (
    <Context.Provider value={{ register, unregister }}>
      {children}
    </Context.Provider>
  );
};

export const useZIndex = (): number => {
  const { register, unregister } = useContext(Context);
  const [zIndex, setZIndex] = useState(1000);

  useEffect(() => {
    const index = register();
    setZIndex(index);

    return () => {
      unregister();
    };
  }, [register, unregister]);

  return zIndex;
};
