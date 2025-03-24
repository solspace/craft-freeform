import { scrollBar } from '@ff-client/styles/mixins';
import { borderRadius, colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const ResultsWrapper = styled.div`
  flex: 1;
  background: ${colors.white};
  padding: ${spacings.xl};
  overflow-y: auto;
  width: calc(100% - 300px);
  ${scrollBar};

  div[class^='ControlWrapper-'] {
    div[class^='CheckboxWrapper-'] {
      align-items: start;

      div[class^='CheckboxItem-'] {
        padding-top: 4px;
      }
    }
  }

  h3 {
    font-size: 1.3em;
    margin-bottom: 0;
  }
`;

export const NoResults = styled.div`
  color: ${colors.gray700};

  p {
    color: ${colors.gray600};
    font-size: 0.9em;
  }
`;

export const StatsContainer = styled.div`
  padding: ${spacings.sm};
`;

export const ChartContainer = styled.div`
  background: ${colors.white};
  border-radius: 4px;
`;

export const TestDescription = styled.p`
  color: ${colors.gray600};
  font-size: 0.9em;
  margin-bottom: ${spacings.md};
  margin-top: 0;
`;

export const TableTestList = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${spacings.sm};
`;

export const TableHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.sm};
  margin-bottom: ${spacings.lg};
`;

export const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacings.md};
  margin-top: ${spacings.xl};
  padding-top: ${spacings.lg};
  border-top: 1px solid ${colors.gray200};
`;

export const PaginationNav = styled.nav`
  display: flex;
  gap: ${spacings.xs};
`;

export const PageButton = styled.button<{ disabled?: boolean }>`
  width: 32px;
  height: 32px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${borderRadius.sm};
  background: ${colors.white};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: ${colors.blue500};
    &::after {
      border-color: ${colors.blue500};
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &::after {
    content: '';
    display: block;
    width: 7px;
    height: 7px;
    border: solid ${colors.gray700};
    border-width: 0 2px 2px 0;
    opacity: 0.8;
    position: relative;
  }

  &.prev-page::after {
    transform: rotate(135deg);
    right: -1px;
  }

  &.next-page::after {
    transform: rotate(-45deg);
    left: -1px;
  }

  &:disabled::after {
    border-color: ${colors.gray300};
  }
`;

export const PageInfo = styled.div`
  color: ${colors.gray600};
  font-size: 13px;
`;

export const ResponseBlock = styled.div`
  position: relative;
  font-family: monospace;
  font-size: 12px;
  line-height: 1.4;
  border-radius: ${borderRadius.md};
  max-height: 60px;
  overflow-y: auto;
  ${scrollBar};

  &:hover {
    max-height: none;
  }
`;

export const TestTableStyled = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: ${colors.white};
  border: 1px solid ${colors.gray200};
  border-radius: ${borderRadius.lg};
  overflow: hidden;
  margin-top: -1px;

  thead {
    background: ${colors.gray050};

    th {
      padding: ${spacings.md} ${spacings.lg};
      font-weight: 600;
      color: ${colors.gray700};
      text-align: left;
      white-space: nowrap;
      border-bottom: 1px solid ${colors.gray200};
    }
  }

  tbody {
    td {
      padding: ${spacings.md} ${spacings.lg};
      vertical-align: middle;

      &.no-break {
        white-space: nowrap;
      }

      &.code {
        font-family: monospace;
        font-size: 12px;
      }

      .view-screenshot-btn {
        padding: 0;
        background: none;
        color: ${colors.blue500};
        border: none;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        transition: color 0.2s ease;

        &:hover {
          color: ${colors.blue600};
          text-decoration: underline;
        }
      }
    }

    tr {
      transition: background-color 0.2s ease;

      &:hover {
        background: ${colors.gray050};
      }
    }
  }
`;

export const DotsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15px, 1fr));
  gap: 12px;
  min-height: 60px;
  align-items: center;
  width: 100%;
  margin: ${spacings.md} 0;

  @media (min-width: 1100px) {
    grid-template-columns: repeat(50, 1fr);
    gap: 8px;
  }
`;

export const TestDot = styled.div<{
  $status: 'success' | 'failed' | 'pending';
}>`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 50%;
  background-color: ${({ $status }) =>
    $status === 'success'
      ? colors.green600
      : $status === 'failed'
        ? colors.red600
        : colors.gray700};
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: scale(1.2);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

export const TestTooltip = styled.div`
  overflow: hidden;
  min-width: 160px;
`;

export const TestTooltipHeader = styled.div`
  padding: ${spacings.xs} ${spacings.md};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const TestTooltipContent = styled.div`
  font-size: 12px;
  line-height: 1.4;
  color: ${colors.gray800};
  padding: ${spacings.xs} ${spacings.md};

  div {
    &:not(:last-child) {
      margin-bottom: 4px;
    }

    &.test-id {
      font-weight: 500;
      color: ${colors.gray900};
    }

    &.test-date {
      color: ${colors.gray600};
      font-size: 11px;
      padding-bottom: ${spacings.xs};
    }

    &.test-response {
      padding-top: ${spacings.xs};
      border-top: 1px solid ${colors.gray200};
      color: ${colors.gray700};
      font-size: 11px;
    }
  }
`;
