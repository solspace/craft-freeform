import { borderRadius, colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

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
