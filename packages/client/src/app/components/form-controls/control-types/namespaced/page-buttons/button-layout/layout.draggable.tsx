import React from 'react';
import { useDrag } from 'react-dnd';

type Props = {
  label: string;
  value: string;
};

export const Draggable: React.FC<Props> = ({ label, value }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'element',
    item: { label, value },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      {label}
    </div>
  );
};
