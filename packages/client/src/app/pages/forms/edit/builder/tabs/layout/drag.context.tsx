import type { Drag } from "@editor/builder/types/drag";
import type React from "react";
import type { PropsWithChildren } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useDragRecovery } from "./drag.recovery";

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
  useDragRecovery();
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<Drag>();
  const [position, setPosition] = useState<number>();

  const dragOn = useCallback((type: Drag, newPosition?: number) => {
    setIsDragging(true);
    setPosition(newPosition);
    setDragType(type);
  }, []);

  const dragOff = useCallback(() => {
    setIsDragging(false);
    setPosition(undefined);
    setDragType(undefined);
  }, []);

  const value = useMemo(
    () => ({ isDragging, dragType, position, dragOn, dragOff }),
    [isDragging, dragType, position, dragOn, dragOff],
  );

  return <DragContext.Provider value={value}>{children}</DragContext.Provider>;
};

export const useDragContext = (): DragContextType => {
  return useContext(DragContext);
};
