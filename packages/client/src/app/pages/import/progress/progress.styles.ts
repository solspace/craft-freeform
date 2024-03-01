import { spacings } from '@ff-client/styles/variables';
import styled, { keyframes } from 'styled-components';

export const ProgressWrapper = styled.div`
  margin-top: ${spacings.lg};
  label {
    font-size: 14px;
  }

  &.primary {
    label {
      font-weight: bold;
    }
  }
`;

type ProgressBarProps = {
  $color: string;
  $value: number;
  $max: number;
  $showPercent?: boolean;
};

const color = 'rgba(255,255,255,.15)';

const animation = keyframes`
  from { background-position: 30px 0; }
  to { background-position: 0 0; }
`;

export const ProgressBar = styled.div<ProgressBarProps>`
  position: relative;

  width: 100%;
  height: 12px;

  padding-bottom: 0px;

  border: none;
  border-radius: 3px;
  background: #e5ecf6;

  font-size: 12px;
  line-height: 12px;

  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;

    display: block;
    width: ${({ $max, $value }) => `${($value / $max) * 100}%`};

    border-radius: 3px;
    background-color: ${({ $color }) => $color};
    background-size: 30px 30px;
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
`;
