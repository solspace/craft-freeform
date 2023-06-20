import { animated } from 'react-spring';
import { labelText, scrollBar } from '@ff-client/styles/mixins';
import { colors, shadows, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

type PropertyEditorProps = {
  $active?: boolean;
};

export const PropertyEditorWrapper = styled.div<PropertyEditorProps>`
  position: absolute;

  left: 0;
  top: 0;
  right: 0;
  bottom: 0;

  z-index: 2;

  overflow: hidden;
  border-right: 1px solid rgb(154 165 177 / 25%);

  pointer-events: ${({ $active }) => ($active ? 'auto' : 'none')};
  background: ${({ $active }) => ($active ? colors.gray050 : 'transparent')};

  transition: background-color 0.2s ease-in-out;
`;

export const AnimatedBlock = styled(animated.div)`
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;

  z-index: 2;
`;

export const CloseLink = styled.a`
  position: absolute;
  right: 10px;
  top: 17px;

  z-index: 5;

  display: block;
  width: 20px;
  height: 20px;
`;

type SectionBlockProps = {
  label?: string;
};

export const Title = styled.h3`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: ${spacings.sm};

  margin: 0;
  padding: ${spacings.lg};

  font-size: 16px;
  box-shadow: ${shadows.bottom};
`;

export const Icon = styled.div`
  width: 20px;
  height: 20px;
`;

export const SectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.lg};

  padding: 0 ${spacings.lg} ${spacings.lg};

  overflow-y: auto;
  overflow-x: hidden;
  ${scrollBar};
`;

export const SectionBlock = styled.section<SectionBlockProps>`
  position: relative;

  display: flex;
  flex-direction: column;
  gap: ${spacings.md};

  margin-top: ${spacings.lg};
  padding-top: ${spacings.lg};

  &:empty {
    display: none;
  }

  &:before {
    content: '';

    position: absolute;
    left: 0;
    top: 0;
    right: 0;

    display: block;
    height: 1px;

    margin: 0 -18px;

    box-shadow: ${shadows.bottom};
  }

  > ${Icon} {
    position: absolute;
    left: 2px;
    top: -4px;
    z-index: 1;

    width: 10px;
    height: 10px;

    fill: rgb(154 165 177 / 75%);
  }

  &:after {
    content: '${({ label }) => label}';

    position: absolute;
    left: -5px;
    top: -7px;

    display: block;
    padding: 0 5px 0 22px;

    background-color: ${colors.gray050};

    ${labelText};
    font-size: 11px;
  }

  &:first-child {
    margin-top: 0;

    &:before,
    &:after,
    > ${Icon} {
      display: none;
    }
  }
`;
