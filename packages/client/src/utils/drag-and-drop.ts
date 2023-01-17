import type { MutableRefObject } from 'react';
import { useRef } from 'react';
import type { ConnectDragSource } from 'react-dnd';

export const useConnectedRef = <T extends HTMLElement = HTMLDivElement>(
  ...dragSources: ConnectDragSource[]
): MutableRefObject<T> => {
  const ref = useRef<T>(null);

  const combinedSources = dragSources.reduce(
    (source, combined) => (arg) => combined(source(arg))
  );

  return combinedSources(ref) as unknown as MutableRefObject<T>;
};
