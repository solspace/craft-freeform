import {
  borderRadius,
  colors,
  shadows,
  spacings,
} from '@ff-client/styles/variables';
import styled from 'styled-components';

import type { ABStatus } from './ab-tests.types';

export const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.lg};
  margin-bottom: 50px;
`;

export const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Cards = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.lg};
`;

export const Card = styled.section`
  padding: 2px 3px;

  background: ${colors.white};
  border: 1px solid ${colors.gray200};
  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows.box};
`;

export const CardHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${spacings.md};

  padding: ${spacings.lg} ${spacings.xl};

  background: ${colors.gray050};
  border-radius: ${borderRadius.lg};

  h2 {
    margin: 0;
    font-size: 32px;
    font-weight: 600;
  }

  p {
    margin: 0 0;
    color: ${colors.gray700};
  }
`;

export const Meta = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${spacings.sm};

  margin-top: 8px;

  color: ${colors.gray700};

  > span {
    &:nth-child(n + 3) {
      &::before {
        content: '•';
        display: inline-block;
        margin-right: ${spacings.sm};
        color: ${colors.gray400};
      }
    }
  }
`;

export const Dot = styled.span<{ $status?: ABStatus }>`
  display: inline-block;
  width: 10px;
  height: 10px;

  border-radius: 50%;
  background: ${({ $status }) => {
    switch ($status) {
      case 'active':
        return colors.green600;
      case 'scheduled':
        return colors.yellow500;
      default:
        return colors.gray400;
    }
  }};
`;

export const ChartArea = styled.div`
  padding: ${spacings.lg} ${spacings.xl} 0;
`;

export const Tabs = styled.div`
  display: inline-flex;
  margin-bottom: ${spacings.lg};

  background: ${colors.gray100};
  border-radius: ${borderRadius.md};

  overflow: hidden;
`;

export const Tab = styled.button<{ $active?: boolean }>`
  cursor: pointer;
  padding: ${spacings.sm} ${spacings.md};

  background: ${({ $active }) => ($active ? colors.gray500 : colors.gray100)};
  border: 0;
  color: ${({ $active }) => ($active ? colors.white : colors.gray800)};
`;

export const Variants = styled.div`
  display: grid;
  justify-content: start;
  align-items: end;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${spacings.md};

  padding: ${spacings.lg} ${spacings.xl} ${spacings.xl};
`;

export const VariantCardWrapper = styled.div``;

export const VariantCard = styled.article`
  padding: 2px;

  background: ${colors.white};
  border: 1px solid ${colors.gray200};
  border-radius: ${borderRadius.md};

  overflow: hidden;

  &.winner {
    border-color: ${colors.green600};
  }
`;

export const Winner = styled.div`
  padding: 6px 6px 10px;
  margin: 0 0 -4px;

  border-radius: ${borderRadius.lg} ${borderRadius.lg} 0 0;
  background: ${colors.green600};

  color: ${colors.white};
  font-size: 18px;
  font-weight: 700;
  text-align: center;
  text-transform: uppercase;

  > div {
    display: inline-block;
    position: relative;

    svg {
      position: absolute;
      left: -33px;
      top: -3px;

      width: 26px;
      height: 26px;
    }
  }
`;

export const VariantHeader = styled.header`
  display: flex;
  align-items: center;
  gap: ${spacings.md};

  padding: ${spacings.md};

  border-radius: ${borderRadius.md};
  background: ${colors.gray050};

  font-size: 20px;
  font-weight: 600;
`;

export const VariantLetter = styled.span`
  display: inline-flex;
  justify-content: center;
  align-items: center;

  width: 35px;
  height: 35px;

  border-radius: 100%;
  background: ${colors.gray300};

  color: ${colors.white};

  font-size: 20px;
  font-weight: 700;
  text-align: center;
`;

export const VariantStats = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 4px 8px;

  padding: ${spacings.md};

  color: ${colors.gray700};
`;

export const VariantFooter = styled.footer`
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: ${spacings.sm} ${spacings.md};

  border-radius: ${borderRadius.md};
  background: ${colors.gray050};

  font-weight: 700;

  .thick {
    font-size: 24px;
    line-height: 24px;
    color: ${colors.gray500};
  }
`;

export const EmptyState = styled.div`
  padding: ${spacings.xl};

  background: ${colors.white};
  border: 1px dashed ${colors.gray300};
  border-radius: ${borderRadius.lg};
  color: ${colors.gray700};
`;

export const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.md};

  max-height: 70vh;
  min-height: 40vh;
  padding: ${spacings.lg} ${spacings.xl};

  overflow: auto;

  td.weight {
    vertical-align: middle;
  }
`;

export const DateRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacings.md};

  .react-datepicker-wrapper {
    width: 100%;
  }
`;

export const VariantEditor = styled.div`
  display: grid;
  grid-template-columns: 1fr 120px auto;
  align-items: center;
  gap: ${spacings.sm};

  padding: ${spacings.md};

  border: 1px solid ${colors.gray200};
  border-radius: ${borderRadius.md};

  select,
  input {
    width: 100%;
  }
`;

export const VariantEditorList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.sm};
`;
