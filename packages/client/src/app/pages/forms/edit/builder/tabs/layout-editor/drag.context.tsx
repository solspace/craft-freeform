import type { PropsWithChildren } from 'react';
import { useContext } from 'react';
import { useState } from 'react';
import React, { createContext } from 'react';
import type { Drag } from '@editor/builder/types/drag';

type DragContextType = {
  isDragging: boolean;
  dragType?: Drag;
  dragOn: (type: Drag) => void;
  dragOff: () => void;
};

const DragContext = createContext<DragContextType>({
  isDragging: false,
  dragType: undefined,
  dragOn: () => void {},
  dragOff: () => void {},
});

export const DragContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<Drag>();

  return (
    <DragContext.Provider
      value={{
        isDragging,
        dragType,
        dragOn: (type) => {
          setIsDragging(true);
          setDragType(type);
        },
        dragOff: () => {
          setIsDragging(false);
          setDragType(undefined);
        },
      }}
    >
      {children}
    </DragContext.Provider>
  );
};

export const useDragContext = (): DragContextType => {
  return useContext(DragContext);
};
