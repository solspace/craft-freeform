import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { useClickOutside } from './use-click-outside';

const callback = jest.fn();

const MockComponent: React.FC = () => {
  const ref = useClickOutside<HTMLDivElement>({
    callback,
    isEnabled: true,
    excludeClassNames: ['wont-trigger', 'nested-exclude'],
  });

  return (
    <div>
      <div ref={ref} data-testid="inside-div">
        Inside
      </div>
      <button>Click me</button>
      <div className="wont-trigger" data-testid="wont-trigger">
        Won't trigger
      </div>
      <div data-testid="will-trigger">Will trigger</div>
      <div className="nested-exclude">
        <div>
          <ul>
            <li>
              <button data-testid="nested-button">wont trigger button</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

describe('useClickOutside', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not close when clicking refObject', () => {
    render(<MockComponent />);

    fireEvent.click(screen.getByTestId('inside-div'));
    expect(callback).toHaveBeenCalledTimes(0);
  });

  it('should close when clicking body', () => {
    render(<MockComponent />);

    fireEvent.click(document.body);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should close when clicking "will-trigger"', () => {
    render(<MockComponent />);

    fireEvent.click(screen.getByTestId('will-trigger'));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should not close when clicking "wont-trigger"', () => {
    render(<MockComponent />);

    fireEvent.click(screen.getByTestId('wont-trigger'));
    expect(callback).toHaveBeenCalledTimes(0);
  });

  it('should not close when clicking "wont-trigger-button"', () => {
    render(<MockComponent />);

    fireEvent.click(screen.getByTestId('nested-button'));
    expect(callback).toHaveBeenCalledTimes(0);
  });
});
