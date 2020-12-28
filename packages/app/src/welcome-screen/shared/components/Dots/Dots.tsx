import React from 'react';
import { ActiveDot, Dot, Wrapper } from './Dots.styles';

interface Props {
  count: number;
  step: number;
}

const Dots: React.FC<Props> = ({ count, step }) => {
  const renderRows = (): React.ReactElement[] => {
    const rows: React.ReactElement[] = [];
    for (let i = 1; i <= count; i++) {
      rows.push(<Dot key={i} />);
    }

    return rows;
  };

  return (
    <Wrapper>
      <ActiveDot position={step} />
      {renderRows()}
    </Wrapper>
  );
};

export default Dots;
