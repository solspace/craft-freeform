import {
  ModalContainer,
  ModalFooter,
  ModalHeader,
} from "@components/modals/modal.styles";
import type { ModalContainerProps } from "@components/modals/modal.types";
import config from "@config/freeform/freeform.config";
import { borderRadius, colors, spacings } from "@ff-client/styles/variables";
import translate from "@ff-client/utils/translations";
import React from "react";
import Skeleton from "react-loading-skeleton";
import styled from "styled-components";

import {
  MetricsTable,
  MetricsTableCell,
  MetricsTableHead,
  MetricsTableHeaderCell,
  MetricsTableRow,
  SectionDescription,
  SectionTitle,
} from "./ai.dashboard.styles";
import {
  createCheckoutSession,
  useAiPlansQuery,
  useAiUsageQuery,
} from "./ai.queries";
import type { PaymentHistory } from "./ai.types";
import { formatAiDate } from "./ai.utils";

const PlansCardsGrid = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: ${spacings.lg};
`;

const PlanCard = styled.div`
  border: 1px solid ${colors.gray100};
  border-radius: ${borderRadius.md};
  padding: calc(${spacings.xl} + ${spacings.xs}) ${spacings.lg};
  display: flex;
  flex-direction: column;
  gap: ${spacings.md};
  align-items: center;
`;

const SectionContent = styled.div`
  margin-top: ${spacings.sm};
`;

const PlansModalContainer = styled(ModalContainer)`
  width: min(1320px, calc(100vw - ${spacings.xl}));
  max-width: min(1320px, calc(100vw - ${spacings.xl}));
`;

const PlansBody = styled.div`
  padding: ${spacings.lg} ${spacings.xl};
`;

const PlanName = styled.strong`
  display: inline-flex;
  align-self: center;
  justify-content: center;
  padding: ${spacings.xs} ${spacings.sm};
  border: 1px solid ${colors.gray300};
  border-radius: ${borderRadius.md};
  background: ${colors.white};
  font-size: 18px;
  font-weight: 300;
  letter-spacing: 0.02em;
  text-align: center;
`;

const PlanDescription = styled.p`
  margin: ${spacings.xs} 0 ${spacings.sm};
  min-height: 40px;
  color: ${colors.gray500};
  font-size: 14px;
  line-height: 1.5;
  text-align: center;
  max-width: 160px;
`;

const PlanMeta = styled.div`
  margin-top: auto;
  display: grid;
  gap: ${spacings.md};
  justify-items: center;
  padding-top: ${spacings.xs};
`;

const PlanPrice = styled.div`
  font-size: 30px;
  font-weight: 800;
  line-height: 1.1;
  text-align: center;
`;

const PlanCredits = styled.div`
  font-size: 17px;
  color: ${colors.gray500};
  text-align: center;
`;

const PlanCreditsValue = styled.span`
  font-size: 19px;
  font-weight: 700;
`;

const PlanButtonRow = styled.div`
  display: flex;
  justify-content: stretch;
  width: 100%;
  margin-top: ${spacings.md};
`;

const BuyNowButton = styled.button`
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${spacings.sm} ${spacings.md};
  background: ${colors.blue500};
  border: 1px solid ${colors.blue600};
  color: ${colors.white};
  border-radius: ${borderRadius.md};
  font-weight: 600;
  max-width: 160px;
  margin: 0 auto;

  &:hover:not(:disabled) {
    background: ${colors.blue600};
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacings.md};

  h1 {
    margin: 0;
    line-height: 1.2;
  }
`;

const PaymentHistorySection = styled.div`
  margin-top: ${spacings.xl};
  padding-top: ${spacings.lg};
  border-top: 1px solid ${colors.gray100};
`;

const PaymentHistoryEmpty = styled.p`
  margin: ${spacings.sm} 0 0;
  color: ${colors.gray500};
  font-size: 14px;
`;

type CurrencyOption = { value: string; label: string };

const FALLBACK_CURRENCY_OPTIONS: CurrencyOption[] = [
  { value: "usd", label: "USD" },
];

function formatBundlePrice(
  price: number,
  bundleCurrency: string,
  siteCurrency?: string,
): string {
  const locale = config.metadata?.craft?.locale;
  const currency = (siteCurrency || bundleCurrency || "usd").toLowerCase();
  const formatted = locale
    ? price.toLocaleString(locale, {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      })
    : price.toLocaleString();
  if (currency === "eur") return `€${formatted}`;
  if (currency === "usd") return `$${formatted}`;
  return `${formatted} ${currency.toUpperCase()}`;
}

const RECENT_PAYMENTS_LIMIT = 5;
const PAYMENT_HISTORY_SKELETON_ROWS = 2;

function sortPaymentHistoryNewestFirst(
  history: PaymentHistory[] | undefined,
): PaymentHistory[] {
  const list = [...(history ?? [])];
  return list.sort((a, b) => {
    const ta = a.paid_at ? Date.parse(a.paid_at) : 0;
    const tb = b.paid_at ? Date.parse(b.paid_at) : 0;
    return tb - ta;
  });
}

function formatPaymentAmount(
  entry: PaymentHistory,
  displayCurrency: string,
): string {
  const raw = entry.package_price;
  const n =
    typeof raw === "number"
      ? raw
      : typeof raw === "string"
        ? parseFloat(raw)
        : NaN;
  if (raw === undefined || raw === null || Number.isNaN(n)) {
    return "—";
  }

  return formatBundlePrice(Math.round(n), displayCurrency, displayCurrency);
}

function paymentCreditsLabel(entry: PaymentHistory): string {
  const c = entry.credits;
  if (c === undefined || c === null) return "—";
  const n = typeof c === "number" ? c : Number(c);
  if (Number.isNaN(n)) return "—";
  return Number.isInteger(n) ? String(n) : n.toLocaleString();
}

export const AiPlansModal: React.FC<ModalContainerProps> = ({ closeModal }) => {
  const [selectedCurrency, setSelectedCurrency] = React.useState<string | null>(
    null,
  );
  const { data: plans, isFetching: isPlansFetching } =
    useAiPlansQuery(selectedCurrency);
  const {
    data: usage,
    isPending: isUsagePending,
    isFetching: isUsageFetching,
    isError: isUsageError,
  } = useAiUsageQuery();

  const showPlansSkeleton = isPlansFetching && !plans;
  const showPaymentsSkeleton =
    showPlansSkeleton ||
    (!isUsageError &&
      (isUsagePending || (isUsageFetching && usage === undefined)));

  const recentPayments = React.useMemo(() => {
    return sortPaymentHistoryNewestFirst(usage?.payment_history).slice(
      0,
      RECENT_PAYMENTS_LIMIT,
    );
  }, [usage?.payment_history]);
  const [checkoutBundleKey, setCheckoutBundleKey] = React.useState<
    string | null
  >(null);
  const currencyOptions = React.useMemo<CurrencyOption[]>(() => {
    const currencies = plans?.supported_currencies ?? [];
    if (!currencies.length) {
      return FALLBACK_CURRENCY_OPTIONS;
    }

    return currencies.map((currency) => ({
      value: String(currency),
      label: String(currency).toUpperCase(),
    }));
  }, [plans?.supported_currencies]);

  const currencyToUse =
    selectedCurrency ?? plans?.currency ?? currencyOptions[0]?.value ?? "usd";

  return (
    <PlansModalContainer>
      <ModalHeader>
        <HeaderActions>
          <h1>{translate("Purchase SolspaceAI Credits")}</h1>
          <div className="select">
            <select
              value={currencyToUse}
              onChange={(event) => setSelectedCurrency(event.target.value)}
              aria-label={translate("Currency")}
            >
              {currencyOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </HeaderActions>
      </ModalHeader>

      <PlansBody>
        {showPlansSkeleton ? (
          <SectionContent>
            <PlansCardsGrid>
              {Array.from({ length: 5 }).map((_, idx) => (
                <PlanCard key={idx}>
                  <strong>
                    <Skeleton width={110} height={14} />
                  </strong>
                  <p>
                    <Skeleton count={2} />
                  </p>
                  <div>
                    <Skeleton width={90} height={12} />
                  </div>
                  <div>
                    <Skeleton width={120} height={12} />
                  </div>
                  <div>
                    <Skeleton width={110} height={32} />
                  </div>
                </PlanCard>
              ))}
            </PlansCardsGrid>
          </SectionContent>
        ) : (
          <SectionContent>
            <PlansCardsGrid>
              {(plans?.bundles ?? []).map((bundle) => (
                <PlanCard key={bundle.key}>
                  <PlanName>
                    {(bundle.name || "").trim() || translate("Credit plan")}
                  </PlanName>
                  <PlanDescription>
                    {(bundle.description || "").trim() ||
                      translate("Credit package for SolspaceAI usage.")}
                  </PlanDescription>
                  <PlanMeta>
                    <PlanPrice>
                      {formatBundlePrice(
                        bundle.price,
                        bundle.currency,
                        plans?.currency,
                      )}
                    </PlanPrice>
                    <PlanCredits>
                      <PlanCreditsValue>
                        {bundle.credits.toLocaleString()}
                      </PlanCreditsValue>{" "}
                      {translate("credits")}
                    </PlanCredits>
                  </PlanMeta>
                  <PlanButtonRow>
                    <BuyNowButton
                      type="button"
                      disabled={checkoutBundleKey === bundle.key}
                      onClick={async () => {
                        try {
                          setCheckoutBundleKey(bundle.key);
                          const currentUrl = window.location.href;
                          const res = await createCheckoutSession(
                            currentUrl,
                            currentUrl,
                            bundle.key,
                            plans?.currency,
                          );
                          if (res?.url) {
                            window.location.href = res.url;
                          }
                        } finally {
                          setCheckoutBundleKey(null);
                        }
                      }}
                    >
                      {checkoutBundleKey === bundle.key
                        ? translate("Loading...")
                        : translate("Buy now")}
                    </BuyNowButton>
                  </PlanButtonRow>
                </PlanCard>
              ))}
            </PlansCardsGrid>
          </SectionContent>
        )}
        <SectionContent>
          <PaymentHistorySection>
            <SectionTitle>{translate("Recent Payments")}</SectionTitle>
            <SectionDescription>
              {translate("Your recent SolspaceAI credit purchase history.")}
            </SectionDescription>
            {showPaymentsSkeleton ? (
              <MetricsTable>
                <MetricsTableHead>
                  <tr>
                    <MetricsTableHeaderCell>
                      {translate("Date")}
                    </MetricsTableHeaderCell>
                    <MetricsTableHeaderCell>
                      {translate("Amount")}
                    </MetricsTableHeaderCell>
                    <MetricsTableHeaderCell>
                      {translate("Credits")}
                    </MetricsTableHeaderCell>
                  </tr>
                </MetricsTableHead>
                <tbody>
                  {Array.from({ length: PAYMENT_HISTORY_SKELETON_ROWS }).map(
                    (_, idx) => (
                      <MetricsTableRow key={`pay-skel-${idx}`}>
                        <MetricsTableCell>
                          <Skeleton width={100} height={12} />
                        </MetricsTableCell>
                        <MetricsTableCell>
                          <Skeleton width={72} height={12} />
                        </MetricsTableCell>
                        <MetricsTableCell>
                          <Skeleton width={56} height={12} />
                        </MetricsTableCell>
                      </MetricsTableRow>
                    ),
                  )}
                </tbody>
              </MetricsTable>
            ) : isUsageError ? (
              <PaymentHistoryEmpty>
                {translate("Unable to load payment history.")}
              </PaymentHistoryEmpty>
            ) : recentPayments.length === 0 ? (
              <PaymentHistoryEmpty>
                {translate("No purchases yet.")}
              </PaymentHistoryEmpty>
            ) : (
              <MetricsTable>
                <MetricsTableHead>
                  <tr>
                    <MetricsTableHeaderCell>
                      {translate("Date")}
                    </MetricsTableHeaderCell>
                    <MetricsTableHeaderCell>
                      {translate("Amount")}
                    </MetricsTableHeaderCell>
                    <MetricsTableHeaderCell>
                      {translate("Credits")}
                    </MetricsTableHeaderCell>
                  </tr>
                </MetricsTableHead>
                <tbody>
                  {recentPayments.map((entry, index) => (
                    <MetricsTableRow
                      key={
                        entry.paid_at
                          ? `${entry.paid_at}-${index}`
                          : `payment-${index}`
                      }
                    >
                      <MetricsTableCell>
                        {formatAiDate(entry.paid_at)}
                      </MetricsTableCell>
                      <MetricsTableCell>
                        {formatPaymentAmount(entry, currencyToUse)}
                      </MetricsTableCell>
                      <MetricsTableCell>
                        {paymentCreditsLabel(entry)}
                      </MetricsTableCell>
                    </MetricsTableRow>
                  ))}
                </tbody>
              </MetricsTable>
            )}
          </PaymentHistorySection>
        </SectionContent>
      </PlansBody>

      <ModalFooter>
        <button type="button" className="btn cancel" onClick={closeModal}>
          {translate("Close")}
        </button>
      </ModalFooter>
    </PlansModalContainer>
  );
};
