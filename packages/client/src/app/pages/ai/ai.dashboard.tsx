import { Breadcrumb } from "@components/breadcrumbs/breadcrumbs";
import { EmptyBlock } from "@components/empty-block/empty-block";
import { HeaderContainer } from "@components/layout/blocks/header-container";
import { useModal } from "@components/modals/modal.context";
import config, { Edition } from "@config/freeform/freeform.config";
import EmptyIcon from "@ff-client/app/pages/forms/edit/builder/tabs/integrations/property-editor/empty.icon";
import { useSidebarSelect } from "@ff-client/hooks/use-sidebar-select";
import translate from "@ff-client/utils/translations";
import axios from "axios";
import React from "react";
import Skeleton from "react-loading-skeleton";
import { Link } from "react-router-dom";

import { SettingsLayout } from "../settings/settings.layout";

import {
  AiEmptyStatePanel,
  AiEmptyStateWrap,
  Card,
  CardActions,
  CardLabel,
  CardsGrid,
  CardValue,
  CreditSummaryCard,
  CreditSummaryValue,
  DashboardWrapper,
  MetricsTable,
  MetricsTableCell,
  MetricsTableHead,
  MetricsTableHeaderCell,
  MetricsTableRow,
  Section,
  SectionDescription,
  SectionTitle,
  StatusDisplay,
  StatusDot,
  StatusMeta,
  StatusValue,
  UsageChart,
} from "./ai.dashboard.styles";
import { AiPlansModal } from "./ai.modal.plans";
import { useAiUsageQuery } from "./ai.queries";
import { formatAiDate, formatAiDateTime } from "./ai.utils";

const AiUsageChart = React.lazy(() => import("./ai.usage-chart"));

const AI_INTEGRATION_PATH = "/integrations/ai/SolspaceAIV1";

type AiSettingsEmptyProps = {
  title: string;
  subtitle: string;
  iconFade?: boolean;
  children?: React.ReactNode;
};

const AiSettingsEmpty: React.FC<AiSettingsEmptyProps> = ({
  title,
  subtitle,
  iconFade,
  children,
}) => (
  <AiEmptyStatePanel>
    <AiEmptyStateWrap>
      <EmptyBlock
        title={title}
        subtitle={subtitle}
        icon={<EmptyIcon />}
        iconFade={iconFade}
      >
        {children}
      </EmptyBlock>
    </AiEmptyStateWrap>
  </AiEmptyStatePanel>
);

export const AiDashboard: React.FC = () => {
  const { openModal } = useModal();
  useSidebarSelect("freeform/settings");

  const isProEdition = config.editions.is(Edition.Pro);
  const { data, isFetching, error, isError } = useAiUsageQuery({
    enabled: isProEdition,
  });

  const isNotFound =
    isError && axios.isAxiosError(error) && error.response?.status === 404;
  const isForbidden =
    isError && axios.isAxiosError(error) && error.response?.status === 403;

  const isHandledHttpError = isNotFound || isForbidden;

  const summary = data ?? undefined;
  const hasAnyData = summary != null;
  const latestPurchaseDate = React.useMemo(() => {
    const history = summary?.payment_history ?? [];
    const dates = history
      .map((entry) => entry?.paid_at)
      .filter((value): value is string => typeof value === "string" && !!value);
    if (!dates.length) {
      return null;
    }

    return dates.sort((a, b) => b.localeCompare(a))[0];
  }, [summary?.payment_history]);

  const creditStatusDisplayText = React.useMemo(() => {
    const raw = summary?.credit_status;
    if (!raw) {
      return translate("Unknown");
    }
    switch (raw) {
      case "Free trial":
      case "Active":
      case "Low credits":
      case "Out of credits":
        return translate(raw);
      default:
        return raw;
    }
  }, [summary]);

  const showLoading = !isNotFound && !isForbidden && isFetching && !summary;
  const showMain = !isNotFound && !isForbidden && !showLoading && !isError;

  const errorMessage =
    isError && axios.isAxiosError(error) && error.response?.data?.message
      ? error.response.data.message
      : isError && error instanceof Error
        ? error.message
        : null;

  const layoutShell = (body: React.ReactNode): React.ReactElement => (
    <div>
      <Breadcrumb
        id="settings"
        label={translate("Settings")}
        url="."
        external
      />
      <Breadcrumb
        id="solspace-ai"
        label={translate("SolspaceAI")}
        url="settings/ai"
      />
      <HeaderContainer>{translate("SolspaceAI")}</HeaderContainer>

      <SettingsLayout activeKey="ai">{body}</SettingsLayout>
    </div>
  );

  if (!isProEdition) {
    return layoutShell(
      <AiSettingsEmpty
        title={translate("SolspaceAI requires Freeform Pro")}
        subtitle={translate(
          "Upgrade to the Freeform Pro edition to get access to SolspaceAI.",
        )}
      >
        <a
          href={Craft.getCpUrl("plugin-store/freeform")}
          className="btn submit"
          target="_blank"
          rel="noreferrer"
        >
          {translate("Plugin Store")}
        </a>
      </AiSettingsEmpty>,
    );
  }

  return layoutShell(
    <>
      {isError && !isHandledHttpError && (
        <AiSettingsEmpty
          title={translate("Error loading usage")}
          subtitle={errorMessage ?? translate("Failed to load usage data")}
          iconFade
        />
      )}

      {isNotFound && (
        <AiSettingsEmpty
          title={translate("SolspaceAI is not enabled")}
          subtitle={translate(
            "Enable SolspaceAI in the Integrations area to view usage.",
          )}
          iconFade
        >
          <Link to={AI_INTEGRATION_PATH} className="btn submit">
            {translate("Enable SolspaceAI")}
          </Link>
        </AiSettingsEmpty>
      )}

      {isForbidden && (
        <AiSettingsEmpty
          title={translate("Authorize SolspaceAI to view usage")}
          subtitle={translate(
            "Authorize SolspaceAI in the Integrations area (click Authorize on the SolspaceAI integration) to view usage.",
          )}
          iconFade
        >
          <Link to={AI_INTEGRATION_PATH} className="btn submit">
            {translate("Go to Integrations")}
          </Link>
        </AiSettingsEmpty>
      )}

      {showLoading && (
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
              <div style={{ height: 220 }} />
            </UsageChart>
          </Section>
        </DashboardWrapper>
      )}

      {showMain && (
        <DashboardWrapper>
          <CardsGrid>
            {summary && (
              <>
                {(summary.credits_remaining != null ||
                  summary.credits_total != null) && (
                  <CreditSummaryCard>
                    <CreditSummaryValue>
                      {summary.credits_remaining != null
                        ? summary.credits_remaining.toLocaleString()
                        : "—"}
                    </CreditSummaryValue>
                    <CardLabel>{translate("Credits remaining")}</CardLabel>
                  </CreditSummaryCard>
                )}

                <Card>
                  <StatusDisplay>
                    <StatusDot $color={summary.credit_status_color ?? null} />
                    <StatusValue $color={summary.credit_status_color ?? null}>
                      {creditStatusDisplayText}
                    </StatusValue>
                  </StatusDisplay>
                  {summary.credit_status === "Active" && latestPurchaseDate && (
                    <StatusMeta>
                      {translate("Since")} {formatAiDate(latestPurchaseDate)}
                    </StatusMeta>
                  )}
                  <CardActions>
                    <button
                      type="button"
                      className="btn submit"
                      onClick={() => openModal(AiPlansModal)}
                    >
                      {translate("Add credits")}
                    </button>
                  </CardActions>
                </Card>
              </>
            )}
          </CardsGrid>

          {summary?.daily_metrics && summary.daily_metrics.length > 0 && (
            <React.Suspense fallback={null}>
              <AiUsageChart metrics={summary.daily_metrics} />
            </React.Suspense>
          )}

          {summary?.request_logs && summary.request_logs.length > 0 && (
            <Section>
              <SectionTitle>{translate("Request Log")}</SectionTitle>
              <SectionDescription>
                {translate(
                  "A list of recent AI requests and their credit usage.",
                )}
              </SectionDescription>
              <MetricsTable>
                <MetricsTableHead>
                  <tr>
                    <MetricsTableHeaderCell>
                      {translate("Date & time")}
                    </MetricsTableHeaderCell>
                    <MetricsTableHeaderCell>
                      {translate("Status")}
                    </MetricsTableHeaderCell>
                    <MetricsTableHeaderCell>
                      {translate("Credits")}
                    </MetricsTableHeaderCell>
                    <MetricsTableHeaderCell>
                      {translate("Request ID")}
                    </MetricsTableHeaderCell>
                  </tr>
                </MetricsTableHead>
                <tbody>
                  {summary.request_logs.map((log, idx) => (
                    <MetricsTableRow key={log.request_id ?? idx}>
                      <MetricsTableCell>
                        {log.requested_at
                          ? formatAiDateTime(log.requested_at)
                          : log.date
                            ? formatAiDate(log.date)
                            : translate("Unknown")}
                      </MetricsTableCell>
                      <MetricsTableCell>
                        {log.status === "success"
                          ? translate("Success")
                          : log.status === "failure"
                            ? translate("Failed")
                            : log.status || "—"}
                      </MetricsTableCell>
                      <MetricsTableCell>
                        {log.credits != null
                          ? `${log.credits.toLocaleString()} ${translate("credits")}`
                          : "—"}
                      </MetricsTableCell>
                      <MetricsTableCell>
                        <code>{log.request_id ?? "—"}</code>
                      </MetricsTableCell>
                    </MetricsTableRow>
                  ))}
                </tbody>
              </MetricsTable>
            </Section>
          )}

          {!hasAnyData && (
            <AiEmptyStateWrap>
              <EmptyBlock
                title={translate("No usage data yet")}
                subtitle={translate(
                  "Usage will appear here once you start using SolspaceAI.",
                )}
                icon={<EmptyIcon />}
                iconFade
              />
            </AiEmptyStateWrap>
          )}
        </DashboardWrapper>
      )}
    </>,
  );
};
