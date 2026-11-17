import { StatusIcon } from "@components/status-icon";
import translate from "@ff-client/utils/translations";
import { generateUrl } from "@ff-client/utils/urls";
import type React from "react";

import { useActivityAlertsQuery } from "./activity-alerts.queries";
import {
  AlertsList,
  LogContent,
  LogIcon,
  LogLink,
  LogNotice,
  LogPeriod,
  LogSummary,
} from "./activity-alerts.styles";

export const ActivityAlerts: React.FC<{ hideLogAlert?: boolean }> = ({
  hideLogAlert = false,
}) => {
  const { data } = useActivityAlertsQuery();

  if (!data) {
    return null;
  }

  if (hideLogAlert || (!data.errors && !data.warningLogs.length)) {
    return null;
  }

  const logLinks = [
    ...(data.errors
      ? [
          {
            key: "errors",
            level: "error",
            label: translate(
              data.errors === 1 ? "{count} error" : "{count} errors",
              { count: data.errors },
            ),
            href: generateUrl(
              "activity?view=events&resolution=open&level=error",
            ),
          },
        ]
      : []),
    ...data.warningLogs.map(({ log, count }) => ({
      key: log,
      level: "warning",
      label: translate(count === 1 ? "{count} warning" : "{count} warnings", {
        count,
      }),
      href: generateUrl(
        "activity?view=events&resolution=open&level=warning&category=system",
      ),
    })),
  ];

  return (
    <AlertsList>
      {!hideLogAlert && !!logLinks.length && (
        <LogNotice
          role="status"
          data-type={data.errors ? "log-list" : "warning"}
          data-status={data.errors ? "error" : "warning"}
        >
          <LogContent>
            <LogSummary>
              <strong>{translate("Activity Log")}:</strong>{" "}
              {logLinks.map(({ key, level, label, href }) => (
                <LogLink key={key} href={href} data-level={level}>
                  <LogIcon aria-hidden="true">
                    <StatusIcon level={level as "error" | "warning"} />
                  </LogIcon>
                  <span>{label}</span>
                </LogLink>
              ))}
            </LogSummary>
            {data.errorLog === "activity" &&
              data.activityRetentionDays !== null && (
                <LogPeriod>
                  {translate(
                    data.activityRetentionDays === 1
                      ? "Recorded in the past day"
                      : "Recorded in the past {days} days",
                    { days: data.activityRetentionDays },
                  )}
                </LogPeriod>
              )}
          </LogContent>
        </LogNotice>
      )}
    </AlertsList>
  );
};
