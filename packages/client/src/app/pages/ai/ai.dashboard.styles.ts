import { borderRadius, colors, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const DashboardWrapper = styled.div`
  padding: ${spacings.xl} ${spacings.lg};
`;

export const AiEmptyStatePanel = styled.div.attrs(() => ({
  className: "tablepane",
}))``;

export const AiEmptyStateWrap = styled.div`
  padding: 80px ${spacings.lg} 100px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${spacings.md};
  margin-bottom: ${spacings.xl};
`;

export const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: left;
  padding: ${spacings.xl} ${spacings.lg};
`;

export const CardLabel = styled.div`
  font-size: 12px;
  color: rgba(0, 0, 0, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.02em;
  margin-bottom: ${spacings.xs};
`;

export const CardValue = styled.div`
  font-size: 36px;
  font-weight: 700;
  line-height: 1.2;
`;

const CardValueSmall = styled(CardValue)`
  font-size: 14px;
`;

export const StatusValue = styled(CardValueSmall)<{ $color?: string | null }>`
  color: ${({ $color }) => $color || "inherit"};
  font-weight: 600;
`;

export const StatusDisplay = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${spacings.xs};
`;

export const StatusDot = styled.span<{ $color?: string | null }>`
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: ${({ $color }) => $color || colors.gray400};
  flex: 0 0 10px;
`;

export const StatusMeta = styled.div`
  margin-top: ${spacings.xs};
  font-size: 12px;
  color: ${colors.gray500};
  font-style: italic;
`;

export const CreditSummaryCard = styled(Card)`
  text-align: center;
  grid-column: span 2;
  padding: ${spacings.xl};
  border: 1px solid ${colors.gray100};
  border-radius: ${borderRadius.lg};
  background: ${colors.gray050};
`;

export const CreditSummaryValue = styled(CardValue)`
  font-size: 40px;
  line-height: 1.05;
`;

export const CardActions = styled.div`
  margin-top: ${spacings.sm};
`;

export const Section = styled.section`
  margin-bottom: ${spacings.xl};

  &:last-child {
    margin-bottom: 0;
  }
`;

export const SectionTitle = styled.h2`
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 ${spacings.sm};
  padding: 0;
`;

export const UsageChart = styled.div`
  background: ${colors.white};
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: ${borderRadius.md};
  padding: ${spacings.md};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  overflow-x: auto;
`;

export const MetricsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${colors.white};
  border-radius: ${borderRadius.md};
  overflow: hidden;
  font-size: 12px;
`;

export const MetricsTableHead = styled.thead`
  background: rgba(0, 0, 0, 0.02);
`;

export const MetricsTableHeaderCell = styled.th`
  text-align: left;
  padding: ${spacings.sm};
  font-weight: 600;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
`;

export const MetricsTableRow = styled.tr`
  &:nth-child(even) {
    background: rgba(0, 0, 0, 0.01);
  }
`;

export const MetricsTableCell = styled.td`
  padding: ${spacings.sm};
  border-bottom: 1px solid rgba(0, 0, 0, 0.03);
  white-space: nowrap;
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: ${spacings.xl} ${spacings.lg};
  background: ${colors.white};
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: ${borderRadius.md};
  color: rgba(0, 0, 0, 0.6);
`;

export const EmptyStateTitle = styled.p`
  font-weight: 600;
  margin: 0 0 ${spacings.sm};
  color: rgba(0, 0, 0, 0.8);
`;

export const EmptyStateActions = styled.p`
  margin-top: ${spacings.md};
`;
