import classes from "@ff-client/utils/classes";
import translate from "@ff-client/utils/translations";
import CheckIcon from "@ff-icons/actions/checkmark";
import { isPast } from "date-fns";
import type { FC } from "react";

import { formatRate, getVariantColor } from "./ab-tests.operations";
import {
  VariantCard,
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
    <VariantCard className={classes(isWinner && "winner")}>
      <VariantHeader>
        <VariantLetter
          style={{
            backgroundColor: `color-mix(in srgb, ${getVariantColor(variant, variantIndex)} 22%, var(--pane-bg, white))`,
            border: `2px solid ${getVariantColor(variant, variantIndex)}`,
          }}
        >
          {String.fromCharCode(65 + variantIndex)}
        </VariantLetter>

        <h3>
          {variant.formName ||
            translate("Variant {number}", { number: variantIndex + 1 })}
        </h3>
        {isWinner && (
          <Winner>
            <CheckIcon aria-hidden="true" />
            {translate(isInPast ? "Winner" : "Winning")}
          </Winner>
        )}
      </VariantHeader>

      <VariantStats>
        <dt>{translate("Weight")}</dt>
        <dd>{variant.weight}%</dd>
        <dt>{translate("Impressions")}</dt>
        <dd>{variant.stats.served.toLocaleString()}</dd>
        <dt>{translate("Interactions")}</dt>
        <dd>{variant.stats.interacted.toLocaleString()}</dd>
        <dt>{translate("Failures")}</dt>
        <dd>{variant.stats.failed.toLocaleString()}</dd>
        <dt>{translate("Conversions")}</dt>
        <dd>{variant.stats.completed.toLocaleString()}</dd>
      </VariantStats>
      <VariantFooter>
        <span>{translate("Conversion Rate")}</span>
        <span className="thick">
          {formatRate(variant.stats.conversionRate)}
        </span>
      </VariantFooter>
    </VariantCard>
  );
};
