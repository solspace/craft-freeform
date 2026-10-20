import { Breadcrumb } from "@components/breadcrumbs/breadcrumbs";
import config from "@config/freeform/freeform.config";
import { useConfirmLeaveBuilder } from "@editor/builder/tabs/modals/confirm-submissions.modal";
import { useAppSelector } from "@editor/store";
import { useSiteContext } from "@ff-client/contexts/site/site.context";
import { useFetchFieldTypes } from "@ff-client/queries/field-types";
import {
  type FormStatsDays,
  useQueryFormStats,
  useQueryFormUsage,
} from "@ff-client/queries/forms";
import { useQueryNotificationTypes } from "@ff-client/queries/notifications";
import classes from "@ff-client/utils/classes";
import translate from "@ff-client/utils/translations";
import { generateUrl } from "@ff-client/utils/urls";
import { useEffect, useState } from "react";
import { useResolvedPath } from "react-router-dom";
import { FormSettingsContainer, SectionHeader } from "./settings.editor.styles";
import {
  activityPeriodLabel,
  SubmissionActivityChart,
} from "./settings.usage.chart";
import { ConfigurationStatusChips } from "./settings.usage.status-chips";
import {
  DiagnosticsGrid,
  Metrics,
  UsageContent,
  UsageHeader,
  UsagePanel,
} from "./settings.usage.styles";

export const FormUsage = () => {
  const form = useAppSelector((state) => state.form);
  const fields = useAppSelector((state) => state.layout.fields);
  const pages = useAppSelector((state) => state.layout.pages);
  const notifications = useAppSelector((state) => state.notifications.items);
  const integrations = useAppSelector((state) => state.integrations);
  const enabledRuleCount = useAppSelector(
    ({ rules }) =>
      [
        ...rules.fields.items,
        ...rules.pages.items,
        ...rules.buttons.items,
        ...rules.notifications.items,
        ...rules.integrations.items,
        ...(rules.submitForm.item ? [rules.submitForm.item] : []),
      ].filter((rule) => rule.enabled).length,
  );
  const { current } = useSiteContext();
  const confirmLeaveBuilder = useConfirmLeaveBuilder();
  const { data: fieldTypes } = useFetchFieldTypes();
  const { data: notificationTypes } = useQueryNotificationTypes();
  const [chartDays, setChartDays] = useState<FormStatsDays>(90);
  const stats = useQueryFormStats(form.id, chartDays);
  const usage = useQueryFormUsage(config.metadata.craft.is5);
  const currentPath = useResolvedPath("");
  const submissionListUrl = (folder: "submissions" | "spam") =>
    form.id && form.canManageSubmissions
      ? generateUrl(
          `${folder}?${new URLSearchParams({
            source: `form:${form.id}`,
            ...(current?.handle ? { site: current.handle } : {}),
          })}`,
        )
      : undefined;
  const submissionsUrl = submissionListUrl("submissions");
  const spamReviewUrl = stats.data?.spamStored
    ? submissionListUrl("spam")
    : undefined;
  const [copyStatus, setCopyStatus] = useState<"copied" | "failed" | null>(
    null,
  );
  useEffect(() => {
    if (!copyStatus) return;
    const timeout = window.setTimeout(() => setCopyStatus(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [copyStatus]);

  const types = Object.entries(
    fields.reduce<Record<string, number>>((counts, field) => {
      const name =
        fieldTypes?.find((type) => type.typeClass === field.typeClass)?.name ??
        field.typeClass.split("\\").pop();
      counts[name] = (counts[name] ?? 0) + 1;
      return counts;
    }, {}),
  ).sort(([a], [b]) => a.localeCompare(b));
  const notificationTypeName = (className: string) => {
    if (!notificationTypes) return undefined;
    const type = notificationTypes.find((item) => item.className === className);
    return translate(type?.name ?? "Unknown");
  };
  const enabledNotifications = notifications.filter((item) => item.enabled);
  const enabledIntegrations = integrations.filter((item) => item.enabled);
  const disabledIntegrations = integrations.filter((item) => !item.enabled);
  const enabled = (value: unknown) =>
    translate(
      value === true ? "Enabled" : value === false ? "Disabled" : "Unknown",
    );
  const storage = enabled(form.settings.general?.storeData);
  const ajax = enabled(form.settings.behavior?.ajax);
  const spamDescription =
    stats.data?.spamStored === false ? "Blocked attempts" : "Currently stored";
  const count = (value?: number) =>
    value === undefined ? "—" : value.toLocaleString();
  const recent = stats.data?.daily.reduce(
    (totals, day) => ({
      submissions: totals.submissions + day.submissions,
      spam: totals.spam + day.spam,
    }),
    { submissions: 0, spam: 0 },
  );
  const details: Array<[string, string | number]> = [
    [translate("Form ID"), form.id ?? translate("Unsaved")],
    [translate("Handle"), form.handle],
    [translate("Site"), current ? `${current.name} (${current.id})` : "—"],
    [
      translate("Freeform"),
      `${config.metadata.freeform.version} (${config.editions.edition})`,
    ],
    [translate("Craft CMS"), config.metadata.craft.version],
    [translate("PHP"), stats.data?.phpVersion ?? "—"],
    [translate("Store submitted data"), storage],
    [translate("AJAX submissions"), ajax],
    [
      translate("Last submission"),
      stats.isError || !stats.data
        ? "—"
        : stats.data.lastSubmissionAt
          ? new Date(stats.data.lastSubmissionAt).toLocaleString(undefined, {
              timeZoneName: "short",
            })
          : translate("No submissions yet."),
    ],
  ];

  const copyDiagnostics = async () => {
    const report = [
      `${translate("Usage & Stats")} — ${form.name}`,
      ...details.map(([label, value]) => `${label}: ${value}`),
      `${translate("Fields")}: ${fields.length} (${types.map(([name, total]) => `${translate(name)}: ${total}`).join(", ")})`,
      `${translate("Pages")}: ${pages.length}`,
      `${translate("Rules")}: ${enabledRuleCount} ${translate("enabled")}`,
      `${translate("Notifications")}: ${enabledNotifications.length}/${notifications.length} ${translate("enabled")}`,
      ...notifications.map(
        (item) => `  ${item.name}: ${enabled(item.enabled)}`,
      ),
      `${translate("Active integrations")}: ${enabledIntegrations.map((item) => item.name).join(", ") || translate("None")}`,
      `${translate("Disabled integrations")}: ${disabledIntegrations.map((item) => item.name).join(", ") || translate("None")}`,
      `${translate("Submissions")}: ${count(stats.data?.totals.submissions)}`,
      `${translate("Spam")} (${translate(spamDescription)}): ${count(stats.data?.totals.spam)}`,
      `${activityPeriodLabel(stats.data?.days ?? chartDays)} (UTC): ${translate("Submissions")}: ${count(recent?.submissions)}, ${translate("Stored spam")}: ${count(recent?.spam)}`,
      `${translate("Usage in Elements")}: ${config.metadata.craft.is5 ? count(usage.data?.length) : translate("Requires Craft 5")}`,
      ...(usage.data?.map(
        (item) => `${item.title} (${item.type}, ${item.status})`,
      ) ?? []),
      `${translate("Snapshot")}: ${stats.data?.generatedAt ?? "—"}`,
      translate(
        "Configuration reflects the current builder, including unsaved changes.",
      ),
      ...(stats.data?.spamStored === false
        ? [
            translate(
              "Spam storage is disabled. The chart only includes stored spam. Discarded spam has no daily history.",
            ),
          ]
        : []),
    ].join("\n");
    try {
      await navigator.clipboard.writeText(report);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  };

  return (
    <FormSettingsContainer>
      <Breadcrumb
        id="settings-usage"
        label={translate("Usage & Stats")}
        url={currentPath.pathname}
      />
      <UsageContent>
        <UsageHeader>
          <div>
            <SectionHeader>{translate("Usage & Stats")}</SectionHeader>
            <p className="muted">
              {translate(
                "Form activity, configuration, and element usage at a glance.",
              )}
            </p>
          </div>
          <div className="copy-action">
            <button
              type="button"
              className="btn"
              onClick={copyDiagnostics}
              disabled={
                !form.id ||
                stats.isPending ||
                (config.metadata.craft.is5 && usage.isPending)
              }
            >
              <i
                className={
                  copyStatus === "copied"
                    ? "fa-light fa-check"
                    : "fa-light fa-copy"
                }
                aria-hidden="true"
              />
              {translate(
                copyStatus === "copied" ? "Copied" : "Copy diagnostics",
              )}
            </button>
            <span role="status" aria-live="polite" className="muted">
              {copyStatus === "failed"
                ? translate(
                    "Could not copy. Take a screenshot of this page instead.",
                  )
                : null}
            </span>
          </div>
        </UsageHeader>

        {!form.id && (
          <p className="muted">
            {translate(
              "Save this form to view submission statistics and element usage.",
            )}
          </p>
        )}
        {stats.isError && (
          <p className="error" role="alert">
            {translate("Could not load submission statistics.")}{" "}
            <button
              type="button"
              className="btn small"
              onClick={() => stats.refetch()}
            >
              {translate("Retry")}
            </button>
          </p>
        )}

        <Metrics aria-label={translate("Form totals")}>
          {[
            {
              label: "Submissions",
              value: count(
                stats.isError ? undefined : stats.data?.totals.submissions,
              ),
              note: translate("All time"),
              reviewUrl: submissionsUrl,
              reviewLabel: "View submissions",
              icon: "fa-inbox",
              tone: "blue",
            },
            {
              label: "Spam",
              value: count(stats.isError ? undefined : stats.data?.totals.spam),
              note: translate(spamDescription),
              reviewUrl: spamReviewUrl,
              reviewLabel: "Review spam",
              icon: "fa-shield-halved",
              tone: "amber",
            },
            {
              label: "Fields",
              value: count(fields.length),
              note: translate("Types: {types}", {
                types: types.length,
              }),
              icon: "fa-input-text",
              tone: "violet",
            },
            {
              label: "Rules",
              value: count(enabledRuleCount),
              note: translate("Enabled"),
              icon: "fa-code-branch",
              tone: "slate",
            },
            {
              label: "Notifications",
              value: count(notifications.length),
              note: translate("{count} enabled", {
                count: enabledNotifications.length,
              }),
              icon: "fa-envelope",
              tone: "teal",
            },
            {
              label: "Integrations",
              value: count(enabledIntegrations.length),
              note: translate("Enabled"),
              icon: "fa-plug",
              tone: "rose",
            },
          ].map((metric) => (
            <div
              className="metric-card"
              data-tone={metric.tone}
              key={metric.label}
            >
              <strong className="metric-value">{metric.value}</strong>
              <div className="metric-details">
                <span className="metric-label">{translate(metric.label)}</span>
                <p className="muted">
                  {metric.reviewUrl ? (
                    <a
                      className="metric-review"
                      href={metric.reviewUrl}
                      onClick={(event) => {
                        event.preventDefault();
                        confirmLeaveBuilder(metric.reviewUrl);
                      }}
                    >
                      {translate(metric.reviewLabel)}
                    </a>
                  ) : (
                    metric.note
                  )}
                </p>
              </div>
              <span className="metric-icon" aria-hidden="true">
                <i className={`fa-light ${metric.icon}`} />
              </span>
            </div>
          ))}
        </Metrics>

        <UsagePanel aria-labelledby="submission-activity-title">
          {stats.data && !stats.isError ? (
            <>
              <SubmissionActivityChart
                daily={stats.data.daily}
                days={chartDays}
                onDaysChange={setChartDays}
                loading={stats.isFetching}
              />
              <p className="muted chart-footnote">
                {translate(
                  "Counts reflect currently stored data. Drafts and deleted submissions are excluded.",
                )}
              </p>
              {!stats.data.spamStored && (
                <p className="muted">
                  {translate(
                    "Spam storage is disabled. The chart only includes stored spam. Discarded spam has no daily history.",
                  )}
                </p>
              )}
            </>
          ) : (
            <>
              <div className="section-heading">
                <div>
                  <h2 id="submission-activity-title">
                    {translate("Submission activity")}
                  </h2>
                  <p className="muted">{translate("Last 90 days (UTC)")}</p>
                </div>
              </div>
              <p className="muted" role="status">
                {translate(
                  stats.isError
                    ? "Statistics unavailable."
                    : form.id
                      ? "Loading statistics…"
                      : "Statistics will appear after saving.",
                )}
              </p>
            </>
          )}
        </UsagePanel>

        {config.metadata.craft.is5 && (
          <UsagePanel
            className="usage-elements-panel"
            data-empty={usage.data?.length === 0}
            aria-labelledby="usage-elements-title"
          >
            <div className="section-heading">
              <div className="heading-label">
                <h2 id="usage-elements-title">
                  {translate("Usage in Elements")}
                </h2>
                {usage.data && (
                  <span className="count">{usage.data.length}</span>
                )}
              </div>
              {usage.data?.length === 0 && (
                <p className="muted usage-empty">
                  {translate(
                    "This form is currently not attached to any elements.",
                  )}
                </p>
              )}
            </div>
            {usage.isPending && form.id && (
              <p className="muted" role="status">
                {translate("Loading element usage…")}
              </p>
            )}
            {usage.isError && (
              <p className="error" role="alert">
                {translate("Could not load element usage.")}{" "}
                <button
                  type="button"
                  className="btn small"
                  onClick={() => usage.refetch()}
                >
                  {translate("Retry")}
                </button>
              </p>
            )}
            {!!usage.data?.length && (
              <div className="element-table">
                <table
                  className="usage-elements-table"
                  aria-label={translate("Usage in Elements")}
                >
                  <thead>
                    <tr>
                      <th scope="col">{translate("Element")}</th>
                      <th scope="col">{translate("Type")}</th>
                      <th scope="col">{translate("Status")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usage.data.map((item) => (
                      <tr key={item.id} className="element-row">
                        <th scope="row">
                          <div
                            className="chip small element usage-element"
                            data-id={item.id}
                          >
                            <div className="chip-content">
                              <a href={item.url} className="label-link">
                                <span>{item.title}</span>
                              </a>
                            </div>
                          </div>
                        </th>
                        <td>{item.type}</td>
                        <td>
                          <span className="usage-status">
                            <span
                              className={classes(
                                "status",
                                item.status.toLowerCase(),
                              )}
                              aria-hidden="true"
                            />
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </UsagePanel>
        )}

        <DiagnosticsGrid>
          <UsagePanel aria-labelledby="form-configuration-title">
            <div className="section-heading">
              <h2 id="form-configuration-title">
                {translate("Form configuration")}
              </h2>
            </div>
            <ConfigurationStatusChips
              id="form-notifications"
              label={translate("Notifications")}
              items={notifications.map((item) => ({
                key: item.uid,
                name: item.name,
                enabled: item.enabled,
                type: notificationTypeName(item.className),
              }))}
            />
            <ConfigurationStatusChips
              id="form-integrations"
              label={translate("Integrations")}
              items={integrations.map((item) => ({
                key: item.id,
                name: item.name,
                enabled: item.enabled,
              }))}
            />
            <div className="configuration-section">
              <h3>{translate("Field types")}</h3>
              <div className="field-type-list">
                {types.length ? (
                  types.map(([name, total]) => (
                    <span className="type-chip" key={name}>
                      {translate(name)}
                      <b>{total}</b>
                    </span>
                  ))
                ) : (
                  <span className="muted">{translate("No fields yet.")}</span>
                )}
              </div>
            </div>
            <div className="configuration-section pages-summary">
              <h3>
                {translate("Pages")}
                <span className="count">{pages.length}</span>
              </h3>
            </div>
            <p className="muted panel-footnote">
              {translate("Includes unsaved changes.")}
            </p>
          </UsagePanel>
          <UsagePanel aria-labelledby="form-diagnostics-title">
            <div className="section-heading">
              <h2 id="form-diagnostics-title">{translate("Diagnostics")}</h2>
            </div>
            <dl className="diagnostics-details">
              {details.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>
                    {label === translate("Handle") ? (
                      <code>{value}</code>
                    ) : (
                      value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            {stats.data && (
              <p className="muted panel-footnote">
                {translate("Snapshot")}:{" "}
                {new Date(stats.data.generatedAt).toLocaleString()}
              </p>
            )}
          </UsagePanel>
        </DiagnosticsGrid>
      </UsageContent>
    </FormSettingsContainer>
  );
};
