import { animated } from 'react-spring';
import {
  borderRadius,
  colors,
  shadows,
  spacings,
} from '@ff-client/styles/variables';
import styled from 'styled-components';

export const WelcomeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;

  height: 80vh;
  padding: 40px;

  background-color: ${colors.white};
  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows.panel}, ${shadows.box};
`;

export const LogoWrapper = styled.div``;

export const InstallWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacings.sm};

  margin-top: 60px;

  font-size: 22px;
  fill: ${colors.teal500};
`;

export const InstallIcon = styled(animated.div)`
  font-size: 30px;
`;

export const InstallText = styled(animated.div)``;

export const ExtraContentWrapper = styled(animated.div)`
  max-width: 60%;
  margin-top: 40px;

  color: ${colors.gray400};
  font-style: italic;
  text-align: center;
`;

export const ButtonsWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: ${spacings.sm};

  margin-top: 40px;
`;

export const Button = styled(animated.div)`
  a {
    color: inherit;
    text-decoration: none;
  }
`;
