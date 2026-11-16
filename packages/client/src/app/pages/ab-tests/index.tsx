import { Breadcrumb } from "@components/breadcrumbs/breadcrumbs";
import { EmptyState } from "@components/empty-state/empty-state";
import { HeaderContainer } from "@components/layout/blocks/header-container";
import { useModal } from "@components/modals/modal.context";
import config from "@config/freeform/freeform.config";
import translate from "@ff-client/utils/translations";
import ChevronIcon from "@ff-icons/chevron-left-solid";
import { isFuture, isPast } from "date-fns";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { ABTestActions } from "./ab-tests.actions";
import { ABTestCard } from "./ab-tests.card";
import { ABTestChart } from "./ab-tests.chart";
import { ABTestModal } from "./ab-tests.modal";
import { ABTestDeleteModal } from "./ab-tests.modal.delete";
import { formatRate, toEditorPayload } from "./ab-tests.operations";
import { ABTestPanel } from "./ab-tests.panel";
import { useAbTestsDashboard } from "./ab-tests.queries";
import {
  Card,
  CardChevron,
  CardDescription,
  CardHeader,
  Cards,
  CardToggle,
  Dot,
  HeaderRow,
  Meta,
  PageLayout,
  PageWrapper,
  PreviewStats,
  Results,
  Summary,
  Variants,
} from "./ab-tests.styles";
import type {
  ABStatus,
  ABTestDashboardItem,
  MetricTab,
} from "./ab-tests.types";

const TestVariantsIcon = () => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M16 4v7M9 11h14M9 11v7M23 11v7" />
    <rect x="4" y="18" width="10" height="10" rx="2" />
    <rect x="18" y="18" width="10" height="10" rx="2" />
  </svg>
);

export const AbTests: React.FC = () => {
  const { openModal } = useModal();
  const [searchParams] = useSearchParams();
  const { data, isPending, isError, refetch } = useAbTestsDashboard();
  const canManage = config.permissions?.abTests === "manage";

  const [tabState, setTabState] = useState<Record<number, MetricTab>>({});
  const [expandedTestId, setExpandedTestId] = useState<number | null>(null);
  const autoOpenRef = useRef<string | null>(null);

  const openEditor = useCallback(
    (test?: ABTestDashboardItem): void => {
      if (canManage) {
        openModal(ABTestModal, test ? { test: toEditorPayload(test) } : {});
      }
    },
    [canManage, openModal],
  );

  useEffect(() => {
    const editId = searchParams.get("edit");
    if (!editId || !data || autoOpenRef.current === editId) {
      return;
    }

    const test = data.find((item) => item.id === Number(editId));
    if (!test) {
      return;
    }

    autoOpenRef.current = editId;
    openEditor(test);
  }, [searchParams, data, openEditor]);

  return (
    <PageLayout>
      <Breadcrumb id="ab-tests-list" label="A/B Tests" url="/ab-tests" />
      <HeaderRow>
        <HeaderContainer>{translate("A/B Tests")}</HeaderContainer>
        {canManage && (
          <button
            type="button"
            className="btn submit add icon"
            onClick={() => openEditor()}
          >
            {translate("Add Test")}
          </button>
        )}
      </HeaderRow>

      <PageWrapper>
        {isPending && (
          <p role="status" className="light">
            {translate("Loading A/B tests…")}
          </p>
        )}
        {isError && (
          <EmptyState
            framed={false}
            title={translate("Unable to load A/B tests")}
            description={translate(
              "Please try again to load your tests and results.",
            )}
            icon={<TestVariantsIcon />}
          >
            <button
              type="button"
              className="btn"
              onClick={() => void refetch()}
            >
              {translate("Try again")}
            </button>
          </EmptyState>
        )}
        {!isPending && !isError && data?.length === 0 && (
          <EmptyState
            framed={false}
            title={translate(
              canManage ? "Create your first A/B test" : "No A/B tests yet",
            )}
            description={translate(
              "Compare different versions of your forms to see which converts best. Add variants, split traffic, and track the results in one place.",
            )}
            icon={<TestVariantsIcon />}
          >
            {canManage && (
              <button
                type="button"
                className="btn submit"
                onClick={() => openEditor()}
              >
                {translate("Create A/B test")}
              </button>
            )}
            <a
              href="https://docs.solspace.com/craft/freeform/v5/forms/ab-testing/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {translate("View documentation")}
            </a>
          </EmptyState>
        )}

        <Cards>
          {data?.map((test) => {
            const isExpanded = expandedTestId === test.id;
            const panelId = `ab-test-results-${test.id}`;
            const activeTab = tabState[test.id] || "conversionRate";
            const isInFuture = test.startDate && isFuture(test.startDate);
            const isInPast = test.endDate && isPast(test.endDate);

            let status: ABStatus = "active";
            if (isInFuture) {
              status = "scheduled";
            } else if (isInPast) {
              status = "ended";
            }

            const statusLabel = translate(
              status.at(0)?.toUpperCase() + status.slice(1) || "",
            );

            const {
              totalImpressions,
              totalInteractions,
              totalFailures,
              totalConversions,
            } = test;

            return (
              <Card key={test.id}>
                <CardHeader>
                  <h2>
                    <CardToggle
                      type="button"
                      aria-label={test.name}
                      aria-expanded={isExpanded}
                      aria-controls={panelId}
                      onClick={() => {
                        setExpandedTestId((prev) =>
                          prev === test.id ? null : test.id,
                        );
                      }}
                    >
                      <span className="test-info">
                        <span className="test-title">{test.name}</span>
                        <Meta as="span">
                          <span>
                            <Dot $status={status} />
                            {statusLabel}
                          </span>
                          {!isInFuture && (
                            <span>
                              {translate("{days} days", { days: test.days })}
                            </span>
                          )}
                          <span>
                            {translate("{count} variants", {
                              count: test.variantCount,
                            })}
                          </span>
                        </Meta>
                      </span>
                      <PreviewStats>
                        {[
                          ["Impressions", totalImpressions.toLocaleString()],
                          ["Conversions", totalConversions.toLocaleString()],
                          [
                            "Conversion Rate",
                            formatRate(
                              totalImpressions > 0
                                ? (totalConversions / totalImpressions) * 100
                                : 0,
                            ),
                          ],
                        ].map(([label, value]) => (
                          <span key={label}>
                            <span className="metric-label">
                              {translate(label)}
                            </span>
                            <strong>{value}</strong>
                          </span>
                        ))}
                      </PreviewStats>
                      <CardChevron $expanded={isExpanded}>
                        <ChevronIcon aria-hidden="true" />
                      </CardChevron>
                    </CardToggle>
                  </h2>

                  {canManage && (
                    <ABTestActions
                      onDelete={() =>
                        openModal(ABTestDeleteModal, {
                          id: test.id,
                          name: test.name,
                        })
                      }
                      onEdit={() => openEditor(test)}
                    />
                  )}
                </CardHeader>

                <ABTestPanel id={panelId} expanded={isExpanded}>
                  {!!test.description && (
                    <CardDescription>{test.description}</CardDescription>
                  )}
                  <Summary>
                    {[
                      ["Impressions", totalImpressions.toLocaleString()],
                      ["Interactions", totalInteractions.toLocaleString()],
                      ["Failures", totalFailures.toLocaleString()],
                      ["Conversions", totalConversions.toLocaleString()],
                      [
                        "Conversion Rate",
                        formatRate(
                          totalImpressions > 0
                            ? (totalConversions / totalImpressions) * 100
                            : 0,
                        ),
                      ],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt>{translate(label)}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </Summary>

                  <Results>
                    <Variants>
                      {test.variants.map((variant) => (
                        <ABTestCard
                          key={variant.id}
                          variant={variant}
                          test={test}
                        />
                      ))}
                    </Variants>

                    <ABTestChart
                      test={test}
                      activeTab={activeTab}
                      setTab={(tabTest, tabId) => {
                        setTabState((prev) => ({
                          ...prev,
                          [tabTest.id]: tabId,
                        }));
                      }}
                    />
                  </Results>
                </ABTestPanel>
              </Card>
            );
          })}
        </Cards>
      </PageWrapper>
    </PageLayout>
  );
};
