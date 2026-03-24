import { Breadcrumb } from "@components/breadcrumbs/breadcrumbs";
import { HeaderContainer } from "@components/layout/blocks/header-container";
import { colors } from "@ff-client/styles/variables";
import translate from "@ff-client/utils/translations";
import type React from "react";
import Skeleton from "react-loading-skeleton";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardLabel,
  CardsGrid,
  CardValue,
  DashboardWrapper,
  EmptyState,
  EmptyStateActions,
  EmptyStateTitle,
  MetricsTable,
  MetricsTableCell,
  MetricsTableHead,
  MetricsTableHeaderCell,
  MetricsTableRow,
  Section,
  SectionTitle,
  UsageChart,
} from "./ai.dashboard.styles";

type AccessStateProps = {
  isForbidden?: boolean;
};

export const AiDashboardAccessState: React.FC<AccessStateProps> = ({
  isForbidden = false,
}) => {
  const title = translate(
    isForbidden
      ? "Authorize SolspaceAI to view usage"
      : "SolspaceAI is not enabled",
  );

  const body = translate(
    isForbidden
      ? "Authorize SolspaceAI in the Integrations area (click Authorize on the SolspaceAI integration) to view usage and spend."
      : "Enable SolspaceAI in the Integrations area to view usage and spend.",
  );

  return (
    <div>
      <Breadcrumb id="ai" label="AI" url="ai" />
      <Breadcrumb id="ai-dashboard" label={translate("Dashboard")} url="ai" />
      <HeaderContainer>{translate("Dashboard")}</HeaderContainer>
      <DashboardWrapper>
        <EmptyState>
          <EmptyStateTitle>{title}</EmptyStateTitle>
          <p>{body}</p>
          <EmptyStateActions>
            <Link to="/integrations" className="btn submit">
              {translate("Go to Integrations")}
            </Link>
          </EmptyStateActions>
        </EmptyState>
      </DashboardWrapper>
    </div>
  );
};
export const AiDashboardLoadingState: React.FC = () => {
  return (
    <div>
      <Breadcrumb id="ai" label="AI" url="ai" />
      <HeaderContainer>{translate("AI")}</HeaderContainer>
      <DashboardWrapper>
        <CardsGrid>
          <Card>
            <CardLabel>
              <Skeleton width={80} height={10} />
            </CardLabel>
            <CardValue>
              <Skeleton width={100} height={24} />
            </CardValue>
          </Card>
          <Card>
            <CardLabel>
              <Skeleton width={80} height={10} />
            </CardLabel>
            <CardValue>
              <Skeleton width={140} height={18} />
            </CardValue>
          </Card>
          <Card>
            <CardLabel>
              <Skeleton width={80} height={10} />
            </CardLabel>
            <CardValue>
              <Skeleton width={120} height={18} />
            </CardValue>
          </Card>
        </CardsGrid>

        <Section>
          <SectionTitle>
            <Skeleton width={140} height={12} />
          </SectionTitle>
          <UsageChart>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={Array.from({ length: 6 }).map((_, idx) => ({
                  date: idx,
                  credits: Math.floor(Math.random() * 20),
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Bar
                  dataKey="credits"
                  fill={colors.gray200}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </UsageChart>
        </Section>

        <Section>
          <SectionTitle>
            <Skeleton width={160} height={12} />
          </SectionTitle>
          <MetricsTable>
            <MetricsTableHead>
              <tr>
                <MetricsTableHeaderCell>
                  <Skeleton width={80} height={10} />
                </MetricsTableHeaderCell>
                <MetricsTableHeaderCell>
                  <Skeleton width={60} height={10} />
                </MetricsTableHeaderCell>
                <MetricsTableHeaderCell>
                  <Skeleton width={90} height={10} />
                </MetricsTableHeaderCell>
                <MetricsTableHeaderCell>
                  <Skeleton width={200} height={10} />
                </MetricsTableHeaderCell>
              </tr>
            </MetricsTableHead>
            <tbody>
              {Array.from({ length: 4 }).map((_, idx) => (
                <MetricsTableRow key={idx}>
                  <MetricsTableCell>
                    <Skeleton width={110} height={10} />
                  </MetricsTableCell>
                  <MetricsTableCell>
                    <Skeleton width={70} height={10} />
                  </MetricsTableCell>
                  <MetricsTableCell>
                    <Skeleton width={130} height={10} />
                  </MetricsTableCell>
                  <MetricsTableCell>
                    <Skeleton width={220} height={10} />
                  </MetricsTableCell>
                </MetricsTableRow>
              ))}
            </tbody>
          </MetricsTable>
        </Section>
      </DashboardWrapper>
    </div>
  );
};
