import { borderRadius, colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const AiHeader = styled.header`
  display: grid;
  grid-template-areas: 'title button';
  grid-template-columns: 1fr auto;
  justify-content: space-between;
  align-items: center;
  gap: ${spacings.md};
  margin-bottom: ${spacings.lg};
`;

export const AiTitle = styled.h1`
  grid-area: title;
  padding: ${spacings.sm} 0;
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  line-height: 34px;
`;

export const AiHeaderButtons = styled.div`
  grid-area: button;
  display: flex;
  align-items: center;
  gap: ${spacings.sm};
`;

export const DashboardWrapper = styled.div``;

export const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${spacings.md};
  margin-bottom: ${spacings.xl};
`;

export const Card = styled.div`
  background: ${colors.white};
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: ${borderRadius.md};
  padding: ${spacings.md};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
`;

export const CardLabel = styled.div`
  font-size: 12px;
  color: rgba(0, 0, 0, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.02em;
  margin-bottom: ${spacings.xs};
`;

export const CardValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
`;

export const CardValueSmall = styled(CardValue)`
  font-size: 14px;
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

export const SectionContent = styled.div`
  margin-top: ${spacings.sm};
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

export const UsageChart = styled.div`
  background: ${colors.white};
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: ${borderRadius.md};
  padding: ${spacings.md};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  overflow-x: auto;
`;

export const UsageChartBars = styled.div`
  display: flex;
  align-items: flex-end;
  gap: ${spacings.sm};
  min-height: 120px;
`;

export const UsageChartBar = styled.div`
  flex: 0 0 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const UsageChartBarValue = styled.div`
  font-size: 10px;
  margin-bottom: 4px;
`;

export const UsageChartBarInner = styled.div`
  width: 100%;
  border-radius: 999px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
`;

export const UsageChartBarLabel = styled.div`
  font-size: 10px;
  margin-top: 4px;
  white-space: nowrap;
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

export const PlansHeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacings.sm};
`;

export const PlansTrialNotice = styled.p`
  margin-bottom: 0.75rem;
  color: ${colors.gray600};
`;
