import config from "@config/freeform/freeform.config";
import { useSiteContext } from "@ff-client/contexts/site/site.context";
import type { FormCardDays } from "@ff-client/types/forms";
import translate from "@ff-client/utils/translations";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import type { CardStats } from "./card.queries";
import { Activity } from "./card.styles";

export type CardSubmission = {
  id: number;
  title: string;
  createdAt: string;
  url: string;
  status?: { name: string; color: string };
};
export const relativeTime = (date: string, now: number, locale?: string) => {
  const seconds = (new Date(date).getTime() - now) / 1000;
  if (Math.abs(seconds) < 60) return translate("Just now");
  const formatter = new Intl.RelativeTimeFormat(locale, {
    numeric: "always",
    style: "narrow",
  });
  if (Math.abs(seconds) < 3600)
    return formatter.format(Math.round(seconds / 60), "minute");
  if (Math.abs(seconds) < 86400)
    return formatter.format(Math.round(seconds / 3600), "hour");
  return formatter.format(Math.round(seconds / 86400), "day");
};
export const CardStatusSummary = ({
  statuses = [],
  compact = false,
}: {
  statuses?: CardStats["statuses"];
  compact?: boolean;
}) => (
  <div className={compact ? "status-summary compact" : "status-summary"}>
    {!compact && <h3>{translate("Submission statuses")}</h3>}
    {statuses.length
      ? statuses.map((status) => (
          <span key={status.id}>
            {status.name} <strong>{status.count.toLocaleString()}</strong>
          </span>
        ))
      : !compact && <p>{translate("No submissions in this period.")}</p>}
  </div>
);

export const CardActivity = ({
  id,
  days = 30,
  compact = false,
}: {
  id: number;
  days?: FormCardDays;
  compact?: boolean;
}) => {
  const { current } = useSiteContext();
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["form-card-activity", id, current?.id, days],
    queryFn: ({ signal }) =>
      axios
        .get<{ submissions: CardSubmission[] }>(
          `/api/forms/${id}/card-activity`,
          { params: { siteId: current?.id, days }, signal },
        )
        .then((response) => response.data),
    staleTime: 60_000,
    retry: false,
  });
  const locale =
    config.metadata.craft.locale?.replaceAll("_", "-") || undefined;
  const formatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
  return (
    <Activity className={compact ? "compact-details" : undefined} data-no-drag>
      {!compact && (
        <div className="activity-heading">
          <h3>{translate("Recent activity")}</h3>
        </div>
      )}
      {isPending ? (
        <p role="status">{translate("Loading activity…")}</p>
      ) : isError ? (
        <p role="status">
          {translate("Could not load activity.")}{" "}
          <button
            type="button"
            disabled={isFetching}
            onClick={() => void refetch()}
          >
            {translate("Try again")}
          </button>
        </p>
      ) : data?.submissions.length ? (
        <ul>
          {data.submissions.slice(0, compact ? 1 : 3).map((item) => (
            <li key={item.id}>
              {item.status && (
                <span
                  className={`status ${item.status.color} submission-status`}
                  title={item.status.name}
                  aria-label={translate("Status: {name}", {
                    name: item.status.name,
                  })}
                  role="img"
                />
              )}
              <a href={item.url} title={item.title}>
                {item.title}
              </a>
              <time
                dateTime={item.createdAt}
                title={formatter.format(new Date(item.createdAt))}
              >
                {relativeTime(item.createdAt, now, locale)}
              </time>
            </li>
          ))}
        </ul>
      ) : (
        <p>{translate("No submissions in this period.")}</p>
      )}
    </Activity>
  );
};
