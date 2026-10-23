import type { FormCardDays } from "@ff-client/types/forms";
import translate from "@ff-client/utils/translations";
import { useCardFieldSummary } from "./card.queries";
import { Activity } from "./card.styles";

export const CardFieldSummary = ({
  id,
  fieldId,
  days,
  compact,
}: {
  id: number;
  fieldId?: number | null;
  days: FormCardDays;
  compact: boolean;
}) => {
  const { data, isPending, isError, refetch, isFetching } = useCardFieldSummary(
    id,
    fieldId,
    days,
  );
  return (
    <Activity className={compact ? "compact-details" : undefined} data-no-drag>
      {!fieldId ? (
        <p>{translate("Choose a summary field in the card menu.")}</p>
      ) : isPending ? (
        <p role="status">{translate("Loading summary…")}</p>
      ) : isError ? (
        <p role="status">
          {translate("Could not load field summary.")}{" "}
          <button
            type="button"
            disabled={isFetching}
            onClick={() => void refetch()}
          >
            {translate("Try again")}
          </button>
        </p>
      ) : (
        data && (
          <>
            <h3>{data.label}</h3>
            {!data.count ? (
              <p>{translate("No responses in this period.")}</p>
            ) : data.kind === "number" ? (
              <div className="field-average">
                <strong>
                  {data.average?.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </strong>{" "}
                <span>
                  {translate("average · {count} responses", {
                    count: data.count.toLocaleString(),
                  })}
                </span>
                {!compact && (
                  <p>
                    {translate("Range: {min}–{max}", {
                      min: String(data.min),
                      max: String(data.max),
                    })}
                  </p>
                )}
              </div>
            ) : (
              <ul>
                {data.options.slice(0, compact ? 1 : 3).map((option) => (
                  <li key={option.label}>
                    <span className="field-option" title={option.label}>
                      {option.label}
                    </span>
                    <span>
                      {option.percent.toLocaleString()}% ·{" "}
                      {option.count.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )
      )}
    </Activity>
  );
};
