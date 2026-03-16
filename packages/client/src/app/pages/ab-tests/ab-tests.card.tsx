import classes from "@ff-client/utils/classes";
import translate from "@ff-client/utils/translations";
import CheckIcon from "@ff-icons/actions/checkmark.svg";
import { isPast } from "date-fns";
import type { FC } from "react";

import { formatRate, getVariantColor } from "./ab-tests.operations";
import {
  VariantCard,
  VariantCardWrapper,
  VariantFooter,
  VariantHeader,
  VariantLetter,
  VariantStats,
  Winner,
} from "./ab-tests.styles";
import type {
  ABTestDashboardItem,
  ABTestDashboardVariant,
} from "./ab-tests.types";

type Props = {
  variant: ABTestDashboardVariant;
  test: ABTestDashboardItem;
};

export const ABTestCard: FC<Props> = ({ variant, test }) => {
  const isWinner = variant.id === test.winnerVariantId;
  const isInPast = test.endDate && isPast(test.endDate);
  const variantIndex = test.variants.indexOf(variant);

  return (
    <VariantCardWrapper key={variant.id}>
      {isWinner && (
        <Winner>
          <div>
            <CheckIcon /> {translate(isInPast ? "Winner" : "Winning")}
          </div>
        </Winner>
      )}

      <VariantCard className={classes(isWinner && "winner")}>
        <VariantHeader>
          <VariantLetter
            style={{
              backgroundColor: getVariantColor(variant, variantIndex),
            }}
          >
            {String.fromCharCode(65 + variantIndex)}
          </VariantLetter>

          {variant.formName}
        </VariantHeader>

        <VariantStats>
          <span>{translate("Weight")}</span>
          <strong>{variant.weight}%</strong>
          <span>{translate("Impressions")}</span>
          <strong>{variant.stats.served.toLocaleString()}</strong>
          <span>{translate("Interactions")}</span>
          <strong>{variant.stats.interacted.toLocaleString()}</strong>
          <span>{translate("Failures")}</span>
          <strong>{variant.stats.failed.toLocaleString()}</strong>
          <span>{translate("Conversions")}</span>
          <strong>{variant.stats.completed.toLocaleString()}</strong>
        </VariantStats>
        <VariantFooter>
          <span>{translate("Conversion Rate")}</span>
          <span className="thick">
            {formatRate(variant.stats.conversionRate)}
          </span>
        </VariantFooter>
      </VariantCard>
    </VariantCardWrapper>
  );
};
