import { colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

type SectinoBlockProps = {
  label?: string;
};

export const Title = styled.h3`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: ${spacings.sm};

  font-size: 16px;
`;

export const Icon = styled.div`
  width: 20px;
  height: 20px;
`;

export const SectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.lg};
`;

export const SectionBlock = styled.section<SectinoBlockProps>`
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

    box-shadow: inset 0 -1px 0 0 rgb(154 165 177 / 25%);
  }

  &:after {
    content: '${({ label }) => label}';

    position: absolute;
    left: -5px;
    top: -7px;

    display: block;
    padding: 0 5px;

    background-color: ${colors.gray050};

    color: rgb(154 165 177 / 75%);
    font-family: system-ui, BlinkMacSystemFont, -apple-system, Segoe UI, Roboto,
      Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
      sans-serif;
    font-size: 11px;
    font-weight: bold;
    text-transform: uppercase;
  }
`;
