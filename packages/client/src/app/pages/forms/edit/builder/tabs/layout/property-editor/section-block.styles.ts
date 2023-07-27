import { labelText, scrollBar } from '@ff-client/styles/mixins';
import { colors, shadows, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

import { Icon } from './property-editor.styles';

export const SectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.lg};

  padding: 0 ${spacings.lg} ${spacings.lg};

  overflow-y: auto;
  overflow-x: hidden;
  ${scrollBar};
`;

type SectionBlockContainerProps = {
  label?: string;
};

export const SectionBlockContainer = styled.section<SectionBlockContainerProps>`
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
    top: -6px;
    z-index: 1;

    width: 14px;
    height: 14px;

    fill: rgb(154 165 177 / 75%);
  }

  &:after {
    content: '${({ label }) => label}';

    position: absolute;
    left: -5px;
    top: -7px;

    display: block;
    padding: 0 5px 0 26px;

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
