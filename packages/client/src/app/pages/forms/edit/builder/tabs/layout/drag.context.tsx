import type { PropsWithChildren } from 'react';
import { useContext } from 'react';
import { useState } from 'react';
import React, { createContext } from 'react';
import type { Drag } from '@editor/builder/types/drag';

type DragContextType = {
  isDragging: boolean;
  dragType?: Drag;
  position?: number;
  dragOn: (type: Drag, position?: number) => void;
  dragOff: () => void;
};

const DragContext = createContext<DragContextType>({
  isDragging: false,
  dragType: undefined,
  position: undefined,
  dragOn: () => void {},
  dragOff: () => void {},
});

export const DragContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<Drag>();
  const [position, setPosition] = useState<number>();

  return (
    <DragContext.Provider
      value={{
        isDragging,
        dragType,
        position,
        dragOn: (type, newPosition) => {
          setIsDragging(true);
          setPosition(newPosition);
          setDragType(type);
        },
        dragOff: () => {
          setIsDragging(false);
          setPosition(undefined);
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
