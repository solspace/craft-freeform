import React, { useEffect, useRef, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { Link } from 'react-router-dom';
import { Breadcrumb } from '@components/breadcrumbs/breadcrumbs';
import { Dropdown } from '@components/elements/custom-dropdown/dropdown';
import { HeaderContainer } from '@components/layout/blocks/header-container';
import config from '@config/freeform/freeform.config';
import translate from '@ff-client/utils/translations';
import axios from 'axios';

import {
  createCheckoutSession,
  useAiPlansQuery,
  useAiUsageQuery,
} from './ai.queries';
import {
  DashboardWrapper,
  EmptyState,
  EmptyStateActions,
  EmptyStateTitle,
  MetricsTable,
  MetricsTableCell,
  MetricsTableHead,
  MetricsTableHeaderCell,
  MetricsTableRow,
  PlansHeaderActions,
  PlansTrialNotice,
  Section,
  SectionContent,
  SectionTitle,
} from './dashboard.styles';

function formatBundlePrice(
  price: number,
  bundleCurrency: string,
  siteCurrency?: string
): string {
  const locale = config.metadata?.craft?.locale;
  const currency = (siteCurrency || bundleCurrency || 'usd').toLowerCase();
  const formatted = locale
    ? price.toLocaleString(locale, {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      })
    : price.toLocaleString();
  if (currency === 'eur') return `€${formatted}`;
  if (currency === 'usd') return `$${formatted}`;
  return `${formatted} ${currency.toUpperCase()}`;
}

type CurrencyOption = { value: string; label: string };

const CURRENCY_OPTIONS: CurrencyOption[] = [
  { value: 'usd', label: 'USD ($)' },
  { value: 'eur', label: 'EUR (€)' },
];

export const AiPlans: React.FC = () => {
  const [addCreditLoading, setAddCreditLoading] = useState(false);
  const [selectedBundleKey, setSelectedBundleKey] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);

  const {
    data: plans,
    isFetching,
    error,
    isError,
  } = useAiPlansQuery(selectedCurrency);
  const { data: usage } = useAiUsageQuery();
  const bundles = plans?.bundles ?? [];
  const hasSyncedCurrency = useRef(false);
  useEffect(() => {
    if (plans?.currency && !hasSyncedCurrency.current) {
      setSelectedCurrency(plans.currency);
      hasSyncedCurrency.current = true;
    }
  }, [plans?.currency]);

  const currencyToUse = selectedCurrency ?? plans?.currency ?? 'usd';

  const defaultBundleKey =
    bundles.length > 0
      ? String(bundles.find((b) => b.suggested)?.key ?? bundles[0].key)
      : '100';
  const bundleKeyToUse = selectedBundleKey || defaultBundleKey;

  useEffect(() => {
    if (
      bundles.length > 0 &&
      !bundles.some((bundle) => String(bundle.key) === selectedBundleKey)
    ) {
      setSelectedBundleKey(defaultBundleKey);
    }
  }, [bundles, defaultBundleKey, selectedBundleKey]);

  const axiosError = axios.isAxiosError(error) ? error : null;
  const status = axiosError?.response?.status;
  const isNotFound = isError && status === 404;
  const isForbidden = isError && status === 403;

  const emptyTitle = translate(
    isNotFound
      ? 'Solspace AI is not enabled'
      : 'Authorize Solspace AI to view plans'
  );
  const emptyMessage = translate(
    isNotFound
      ? 'Enable Solspace AI in the Integrations area to view plans.'
      : 'Authorize Solspace AI in the Integrations area to view plans.'
  );

  if (isNotFound || isForbidden) {
    return (
      <div>
        <Breadcrumb id="ai" label="AI" url="ai" />
        <Breadcrumb id="ai-plans" label={translate('Plans')} url="ai/plans" />
        <HeaderContainer>{translate('Plans')}</HeaderContainer>
        <DashboardWrapper>
          <EmptyState>
            <EmptyStateTitle>{emptyTitle}</EmptyStateTitle>
            <p>{emptyMessage}</p>
            {isNotFound && (
              <EmptyStateActions>
                <Link to="/integrations" className="btn submit">
                  {translate('Go to Integrations')}
                </Link>
              </EmptyStateActions>
            )}
          </EmptyState>
        </DashboardWrapper>
      </div>
    );
  }

  if (isFetching && !plans) {
    return (
      <div>
        <Breadcrumb id="ai" label="AI" url="ai" />
        <Breadcrumb id="ai-plans" label={translate('Plans')} url="ai/plans" />
        <HeaderContainer
          extra={
            <PlansHeaderActions>
              <Skeleton width={56} height={34} />
              <Skeleton width={140} height={34} />
              <Skeleton width={100} height={34} />
            </PlansHeaderActions>
          }
        >
          {translate('Plans')}
        </HeaderContainer>
        <DashboardWrapper>
          <Section>
            <SectionTitle>
              <Skeleton width={140} height={14} />
            </SectionTitle>
            <SectionContent>
              <MetricsTable>
                <MetricsTableHead>
                  <MetricsTableRow>
                    <MetricsTableHeaderCell>
                      <Skeleton width={60} height={10} />
                    </MetricsTableHeaderCell>
                    <MetricsTableHeaderCell>
                      <Skeleton width={60} height={10} />
                    </MetricsTableHeaderCell>
                  </MetricsTableRow>
                </MetricsTableHead>
                <tbody>
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <MetricsTableRow key={idx}>
                      <MetricsTableCell>
                        <Skeleton width={80} height={10} />
                      </MetricsTableCell>
                      <MetricsTableCell>
                        <Skeleton width={60} height={10} />
                      </MetricsTableCell>
                    </MetricsTableRow>
                  ))}
                </tbody>
              </MetricsTable>
            </SectionContent>
          </Section>
          <Section>
            <SectionTitle>
              <Skeleton width={120} height={14} />
            </SectionTitle>
            <SectionContent>
              <MetricsTable>
                <MetricsTableHead>
                  <MetricsTableRow>
                    <MetricsTableHeaderCell>
                      <Skeleton width={50} height={10} />
                    </MetricsTableHeaderCell>
                    <MetricsTableHeaderCell>
                      <Skeleton width={60} height={10} />
                    </MetricsTableHeaderCell>
                    <MetricsTableHeaderCell>
                      <Skeleton width={50} height={10} />
                    </MetricsTableHeaderCell>
                  </MetricsTableRow>
                </MetricsTableHead>
                <tbody>
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <MetricsTableRow key={idx}>
                      <MetricsTableCell>
                        <Skeleton width={120} height={10} />
                      </MetricsTableCell>
                      <MetricsTableCell>
                        <Skeleton width={60} height={10} />
                      </MetricsTableCell>
                      <MetricsTableCell>
                        <Skeleton width={50} height={10} />
                      </MetricsTableCell>
                    </MetricsTableRow>
                  ))}
                </tbody>
              </MetricsTable>
            </SectionContent>
          </Section>
        </DashboardWrapper>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb id="ai" label="AI" url="ai" />
      <Breadcrumb id="ai-plans" label={translate('Plans')} url="ai/plans" />
      <HeaderContainer
        extra={
          bundles.length > 0 && (
            <PlansHeaderActions>
              <Dropdown
                value={currencyToUse}
                options={CURRENCY_OPTIONS.map((opt) => ({
                  value: opt.value,
                  label: opt.label,
                }))}
                onChange={(value) => setSelectedCurrency(value)}
              />
              {bundles.length > 1 && (
                <Dropdown
                  value={bundleKeyToUse}
                  options={bundles.map((bundle) => ({
                    value: String(bundle.key),
                    label: `${formatBundlePrice(
                      bundle.price,
                      bundle.currency,
                      plans?.currency
                    )} — ${bundle.credits.toLocaleString()} credits`,
                  }))}
                  onChange={(value) => setSelectedBundleKey(value)}
                />
              )}
              <button
                type="button"
                className="btn submit"
                disabled={addCreditLoading}
                onClick={async () => {
                  setAddCreditLoading(true);
                  try {
                    const currentUrl = window.location.href;
                    const res = await createCheckoutSession(
                      currentUrl,
                      currentUrl,
                      bundleKeyToUse,
                      currencyToUse
                    );
                    if (res?.url) {
                      window.location.href = res.url;
                    } else {
                      setAddCreditLoading(false);
                    }
                  } catch {
                    setAddCreditLoading(false);
                  }
                }}
              >
                {addCreditLoading
                  ? translate('Loading…')
                  : translate('Add credits')}
              </button>
            </PlansHeaderActions>
          )
        }
      >
        {translate('Plans')}
      </HeaderContainer>
      <DashboardWrapper>
        {plans && bundles.length > 0 ? (
          <>
            <Section>
              <SectionTitle>{translate('Credit bundles')}</SectionTitle>
              <SectionContent>
                {plans.trial_credits != null && plans.trial_credits > 0 && (
                  <PlansTrialNotice>
                    {translate('New users get {count} free credits.', {
                      count: plans.trial_credits.toLocaleString(),
                    })}
                  </PlansTrialNotice>
                )}
                <MetricsTable>
                  <MetricsTableHead>
                    <MetricsTableRow>
                      <MetricsTableHeaderCell>
                        {translate('Price')}
                      </MetricsTableHeaderCell>
                      <MetricsTableHeaderCell>
                        {translate('Credits')}
                      </MetricsTableHeaderCell>
                    </MetricsTableRow>
                  </MetricsTableHead>
                  <tbody>
                    {bundles.map((bundle) => (
                      <MetricsTableRow key={bundle.key}>
                        <MetricsTableCell>
                          {formatBundlePrice(
                            bundle.price,
                            bundle.currency,
                            plans?.currency
                          )}
                        </MetricsTableCell>
                        <MetricsTableCell>
                          {bundle.credits.toLocaleString()}
                        </MetricsTableCell>
                      </MetricsTableRow>
                    ))}
                  </tbody>
                </MetricsTable>
              </SectionContent>
            </Section>

            {usage?.payment_history && usage.payment_history.length > 0 && (
              <Section>
                <SectionTitle>{translate('Payment history')}</SectionTitle>
                <SectionContent>
                  <MetricsTable>
                    <MetricsTableHead>
                      <MetricsTableRow>
                        <MetricsTableHeaderCell>
                          {translate('Date')}
                        </MetricsTableHeaderCell>
                        <MetricsTableHeaderCell>
                          {translate('Amount')}
                        </MetricsTableHeaderCell>
                        <MetricsTableHeaderCell>
                          {translate('Credits')}
                        </MetricsTableHeaderCell>
                      </MetricsTableRow>
                    </MetricsTableHead>
                    <tbody>
                      {usage.payment_history
                        .slice()
                        .reverse()
                        .map((entry, idx) => (
                          <MetricsTableRow key={idx}>
                            <MetricsTableCell>
                              {entry.paid_at
                                ? new Date(entry.paid_at).toLocaleString(
                                    config.metadata?.craft?.locale || undefined
                                  )
                                : '—'}
                            </MetricsTableCell>
                            <MetricsTableCell>
                              {entry.package_price != null
                                ? `$${entry.package_price.toFixed(2)}`
                                : '—'}
                            </MetricsTableCell>
                            <MetricsTableCell>
                              {entry.credits != null
                                ? entry.credits.toLocaleString()
                                : '—'}
                            </MetricsTableCell>
                          </MetricsTableRow>
                        ))}
                    </tbody>
                  </MetricsTable>
                </SectionContent>
              </Section>
            )}
          </>
        ) : (
          <EmptyState>
            <EmptyStateTitle>{translate('No plans available')}</EmptyStateTitle>
            <p>
              {translate(
                'Plans and credit bundles are configured in Solspace AI. Contact your administrator to add plans.'
              )}
            </p>
          </EmptyState>
        )}
      </DashboardWrapper>
    </div>
  );
};
