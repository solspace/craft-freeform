import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { Link } from 'react-router-dom';
import { Breadcrumb } from '@components/breadcrumbs/breadcrumbs';
import { HeaderContainer } from '@components/layout/blocks/header-container';
import config from '@config/freeform/freeform.config';
import { colors } from '@ff-client/styles/variables';
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
  EmptyStateTitle,
  MetricsTable,
  MetricsTableCell,
  MetricsTableHead,
  MetricsTableHeaderCell,
  MetricsTableRow,
  PlansHeaderActions,
  PlansSelect,
  Section,
  SectionTitle,
} from './dashboard.styles';

function formatBundlePrice(
  price: number,
  _bundleCurrency: string,
  siteCurrency?: string
): string {
  const locale = config.metadata?.craft?.locale;
  const currency = (siteCurrency || _bundleCurrency || 'usd').toLowerCase();
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

const CURRENCY_OPTIONS: { value: string; label: string }[] = [
  { value: 'usd', label: 'USD' },
  { value: 'eur', label: 'EUR' },
];

export const AiPlans: React.FC = () => {
  const [addCreditLoading, setAddCreditLoading] = React.useState(false);
  const [selectedBundleKey, setSelectedBundleKey] = React.useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = React.useState<string | null>(
    null
  );

  const {
    data: plans,
    isFetching,
    error,
    isError,
  } = useAiPlansQuery(selectedCurrency === null ? undefined : selectedCurrency);
  const { data: usage } = useAiUsageQuery();
  const bundles = plans?.bundles ?? [];
  const hasSyncedCurrency = React.useRef(false);
  React.useEffect(() => {
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

  React.useEffect(() => {
    if (
      bundles.length > 0 &&
      !bundles.some((b) => String(b.key) === selectedBundleKey)
    ) {
      setSelectedBundleKey(defaultBundleKey);
    }
  }, [bundles, defaultBundleKey, selectedBundleKey]);

  const isNotFound =
    isError && axios.isAxiosError(error) && error.response?.status === 404;
  const isForbidden =
    isError && axios.isAxiosError(error) && error.response?.status === 403;

  const emptyTitle = isNotFound
    ? translate('Solspace AI is not enabled')
    : translate('Authorize Solspace AI to view plans');
  const emptyMessage = isNotFound
    ? translate('Enable Solspace AI in the Integrations area to view plans.')
    : translate(
        'Authorize Solspace AI in the Integrations area to view plans.'
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
              <p style={{ marginTop: '1rem' }}>
                <Link to="/integrations" className="btn submit">
                  {translate('Go to Integrations')}
                </Link>
              </p>
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
            <div style={{ marginTop: '0.5rem' }}>
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
            </div>
          </Section>
          <Section>
            <SectionTitle>
              <Skeleton width={120} height={14} />
            </SectionTitle>
            <div style={{ marginTop: '0.5rem' }}>
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
            </div>
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
              <PlansSelect
                value={currencyToUse}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                aria-label={translate('Currency')}
              >
                {CURRENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </PlansSelect>
              {bundles.length > 1 && (
                <PlansSelect
                  value={bundleKeyToUse}
                  onChange={(e) => setSelectedBundleKey(e.target.value)}
                >
                  {bundles.map((b) => (
                    <option key={b.key} value={b.key}>
                      {formatBundlePrice(b.price, b.currency, plans?.currency)}{' '}
                      — {b.credits.toLocaleString()} credits
                    </option>
                  ))}
                </PlansSelect>
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
              <div style={{ marginTop: '0.5rem' }}>
                {plans.trial_credits != null && plans.trial_credits > 0 && (
                  <p
                    style={{
                      marginBottom: '0.75rem',
                      color: colors.gray600,
                    }}
                  >
                    {translate('New users get {count} free credits.', {
                      count: plans.trial_credits.toLocaleString(),
                    })}
                  </p>
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
                    {bundles.map((b) => (
                      <MetricsTableRow key={b.key}>
                        <MetricsTableCell>
                          {formatBundlePrice(
                            b.price,
                            b.currency,
                            plans?.currency
                          )}
                        </MetricsTableCell>
                        <MetricsTableCell>
                          {b.credits.toLocaleString()}
                        </MetricsTableCell>
                      </MetricsTableRow>
                    ))}
                  </tbody>
                </MetricsTable>
              </div>
            </Section>

            {usage?.payment_history && usage.payment_history.length > 0 && (
              <Section>
                <SectionTitle>{translate('Payment history')}</SectionTitle>
                <div style={{ marginTop: '0.5rem' }}>
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
                </div>
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
