import React from 'react';
import ReactDOM from 'react-dom/client';

export const TokenDropdown: React.FC = () => {
  return <div>this is tokens dropdown</div>;
};

export const renderTokenDropdown = (container: HTMLDivElement, props: any) => {
  const root = ReactDOM.createRoot(container);
  root.render(<TokenDropdown {...props} />);

  const close = () => {
    root.unmount();
    document.body.removeChild(container);
    props.onClose();
  };

  return {
    close,
    updatePosition: (position: { top: number; left: number }) => {
      root.render(
        <TokenDropdown {...props} position={position} onClose={close} />
      );
    },
  };
};
