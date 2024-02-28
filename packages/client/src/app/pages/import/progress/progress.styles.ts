import { spacings } from '@ff-client/styles/variables';
import styled, { keyframes } from 'styled-components';

export const ProgressWrapper = styled.div`
  //
`;

type ProgressBarProps = {
  $value: number;
  $max: number;
  $showPercent?: boolean;
};

const color = 'rgba(255,255,255,.15)';

const animation = keyframes`
  from { background-position: 40px 0; }
  to { background-position: 0 0; }
`;

export const ProgressBar = styled.div<ProgressBarProps>`
  position: relative;

  width: 100%;
  height: 15px;

  padding-top: 16px;
  margin: ${spacings.lg} 0;

  border: none;
  border-radius: 5px;
  background: #e5ecf6;

  font-size: 12px;

  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;

    display: block;
    width: ${({ $max, $value }) => `${($value / $max) * 100}%`};

    border-radius: 5px;
    background-color: #e12d39;
    background-size: 40px 40px;
    background-image: linear-gradient(
      45deg,
      ${color} 25%,
      transparent 25%,
      transparent 50%,
      ${color} 50%,
      ${color} 75%,
      transparent 75%,
      transparent
    );

    transition: width 0.3s ease;
  }

  &.active {
    &:before {
      animation: ${animation} 2s linear infinite;
    }
  }

  &:after {
    content: '${({ $max, $value }) => `${Math.round(($value / $max) * 100)}%`}';
    display: ${({ $showPercent }) => ($showPercent ? 'block' : 'none')};

    position: absolute;
    left: calc(${({ $max, $value }) => `${($value / $max) * 100}%`} - 30px);
    top: 0;

    line-height: 10px;
    font-size: 10px;
    color: #fff;
  }
`;
