import { StatusIcon } from "@components/status-icon";
import config from "@config/freeform/freeform.config";
import translate from "@ff-client/utils/translations";
import { generateUrl } from "@ff-client/utils/urls";
import type React from "react";
import type { ReactNode } from "react";

import CircleIcon from "./icons/circle.icon";
import DeleteIcon from "./icons/delete.icon";
import InfoIcon from "./icons/info.icon";
import NewIcon from "./icons/new.icon";
import TriangleIcon from "./icons/triangle.icon";
import { useNoticeDeleteMutation, useNoticesQuery } from "./notices.queries";
import {
  CloseButton,
  Icon,
  LogContent,
  LogIcon,
  LogLink,
  LogNotice,
  LogPeriod,
  LogSummary,
  Message,
  NoticeItem,
  NoticesList,
} from "./notices.styles";

const icons: Record<string, ReactNode> = {
  info: <InfoIcon />,
  warning: <TriangleIcon />,
  critical: <TriangleIcon />,
  error: <CircleIcon />,
  new: <NewIcon />,
};

const warningLabels = {
  activity: {
    singular: "{count} warning",
    plural: "{count} warnings",
  },
  "error-log": {
    singular: "{count} warning in error log",
    plural: "{count} warnings in error log",
  },
  "integrations-log": {
    singular: "{count} integration warning",
    plural: "{count} integration warnings",
  },
  "email-log": {
    singular: "{count} email warning",
    plural: "{count} email warnings",
  },
};

export const Notices: React.FC<{ hideLogAlert?: boolean }> = ({
  hideLogAlert = false,
}) => {
  const { data } = useNoticesQuery();
  const mutation = useNoticeDeleteMutation();

  if (!data) {
    return null;
  }

  const notices = config.feed ? data.notices : [];
  if (
    !notices.length &&
    (hideLogAlert || (!data.errors && !data.warningLogs.length))
  ) {
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
              data.errorLog === "activity"
                ? "activity?view=events&resolution=open&level=error"
                : "settings/error-log",
            ),
          },
        ]
      : []),
    ...data.warningLogs.map(({ log, count }) => ({
      key: log,
      level: "warning",
      label: translate(
        warningLabels[log][count === 1 ? "singular" : "plural"],
        { count },
      ),
      href: generateUrl(
        log === "activity"
          ? "activity?view=events&resolution=open&level=warning&category=system"
          : `settings/${log}`,
      ),
    })),
  ];

  return (
    <NoticesList>
      {notices.map((notice) => (
        <NoticeItem key={notice.id} data-type={notice.type}>
          <Icon>{icons[notice.type]}</Icon>
          <Message>{notice.message}</Message>

          <CloseButton onClick={() => mutation.mutate(notice.id)}>
            <DeleteIcon />
          </CloseButton>
        </NoticeItem>
      ))}

      {!hideLogAlert && !!logLinks.length && (
        <LogNotice
          role="status"
          data-type={data.errors ? "log-list" : "warning"}
          data-status={data.errors ? "error" : "warning"}
        >
          <LogContent>
            <LogSummary>
              <strong>
                {translate(
                  data.errorLog === "activity"
                    ? "Activity Log"
                    : "Classic logs",
                )}
                :
              </strong>{" "}
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
    </NoticesList>
  );
};
