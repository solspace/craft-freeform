import { labelText, scrollBar } from '@ff-client/styles/mixins';
import { colors, shadows, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

import { Icon } from './property-editor.styles';

export const SectionWrapper = styled.div`
  display: flex;
  flex-direction: column;

  padding: 0 ${spacings.lg} ${spacings.lg};

  overflow-y: auto;
  overflow-x: hidden;
  ${scrollBar};
`;

export const SectionBlockIcon = styled(Icon)`
  position: absolute;
  left: 2px;
  top: 12px;
  z-index: 1;

  width: 14px;
  height: 14px;

  fill: rgb(154 165 177 / 75%);
`;

export const SectionBlockContainer = styled.section`
  position: relative;

  display: flex;
  flex-direction: column;
  gap: ${spacings.md};

  margin-top: ${spacings.lg};
  padding-top: ${spacings.lg};
  padding-bottom: ${spacings.lg};

  &:empty {
    display: none;

    & + ${SectionBlockIcon} {
      display: none;
    }
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

  &:after {
    content: attr(data-label);

    position: absolute;
    left: -5px;
    top: -7px;

    display: block;
    padding: 0 5px 0 26px;

    background-color: ${colors.gray050};

    ${labelText};
    font-size: 11px;
  }
`;

export const SectionBlockWrapper = styled.div`
  position: relative;

  &:first-child {
    ${SectionBlockContainer} {
      margin-top: 0;

      &:before,
      &:after {
        display: none;
      }
    }

    ${SectionBlockIcon} {
      display: none;
    }
  }
`;
