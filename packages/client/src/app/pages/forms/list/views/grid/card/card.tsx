import {
  Tooltip,
  type TooltipProps,
} from "@components/elements/tooltip/tooltip";
import config from "@config/freeform/freeform.config";
import { useDeleteFormModal } from "@ff-client/app/pages/forms/list/modals/hooks/use-delete-form-modal";
import { useCheckOverflow } from "@ff-client/hooks/use-check-overflow";
import { useFMFormStatsQuery } from "@ff-client/queries/form-monitor";
import { QKForms } from "@ff-client/queries/forms";
import type {
  FormCardContent,
  FormCardDays,
  FormCardSize,
  FormWithStats,
} from "@ff-client/types/forms";
import classes from "@ff-client/utils/classes";
import translate from "@ff-client/utils/translations";
import { generateUrl } from "@ff-client/utils/urls";
import { useQueryClient } from "@tanstack/react-query";
import type React from "react";
import type { MouseEventHandler } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FormIcon } from "../../../form-icon";
import {
  useArchiveFormMutation,
  useCloneFormMutation,
} from "../grid.mutations";
import { CardActivity, CardStatusSummary } from "./card.activity";
import { CardChart, StatChange } from "./card.chart";
import { CardFieldSummary } from "./card.field-summary";
import { FMLoading } from "./card.loading";
import { FormMonitorStats } from "./card.monitor.stats";
import type { CardStats } from "./card.queries";
import { CardSizeMenu } from "./card.size-menu";
import {
  Activity,
  CardBody,
  CardWrapper,
  Controls,
  ExpandedStats,
  FMContainer,
  FormBody,
  FormBodyContent,
  FormIdentity,
  LinkList,
  Subtitle,
  Title,
  TitleLink,
} from "./card.styles";

type Props = {
  form: FormWithStats;
  size?: FormCardSize;
  days?: FormCardDays;
  stats?: CardStats;
  content?: FormCardContent;
  fieldId?: number | null;
  onContentChange?: (content: FormCardContent, fieldId?: number | null) => void;
  onResize?: (size: FormCardSize) => void;
  isLayoutBusy?: boolean;
  isDraggingInProgress?: boolean;
  isExpressEdition?: boolean;
  canMove?: boolean;
  onKeyboardMove?: (formId: number, key: string) => void;
};

const tooltipProps: Omit<TooltipProps, "children"> = {
  position: "top",
  animation: "fade",
  delay: [100, 0] as unknown as number,
};

const defaultFormIcon =
  '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h4"/></g></svg>';

export const Card: React.FC<Props> = ({
  form,
  size = "1x1",
  days = 30,
  stats,
  content = "overview",
  fieldId,
  onContentChange,
  onResize,
  isLayoutBusy = false,
  isDraggingInProgress,
  isExpressEdition,
  canMove,
  onKeyboardMove,
}) => {
  const archiveMutation = useArchiveFormMutation();
  const cloneMutation = useCloneFormMutation();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { canDelete } = config.metadata.freeform;

  const [titleRef, isTitleOverflowing] = useCheckOverflow<HTMLHeadingElement>();
  const [descriptionRef, isDescriptionOverflowing] =
    useCheckOverflow<HTMLSpanElement>();

  const isWide = size.startsWith("2");
  const isTall = size.endsWith("2");
  const { id, name, description, dateArchived, settings, formMonitor } = form;
  const { color } = settings.general;
  const hasBadge = config.metadata.craft.is5;

  const isArchiving =
    archiveMutation.isPending && archiveMutation.context === id;
  const isSuccess = archiveMutation.isSuccess && archiveMutation.context === id;
  const isCloning = cloneMutation.isPending && cloneMutation.context === id;
  const isDisabled = isCloning || isArchiving;

  const openDeleteFormModal = useDeleteFormModal({ form });

  const onNavigate: MouseEventHandler<HTMLHeadingElement> = (event): void => {
    if (event.metaKey || event.ctrlKey || event.button === 1) {
      window.open(generateUrl(`forms/${id}`), "_blank");
    } else {
      queryClient.invalidateQueries({ queryKey: QKForms.single(Number(id)) });
      navigate(`${id}`);
    }
  };

  const hasTitleLink = form.links.filter(({ type }) => type === "title").length;
  const linkList = form.links.filter(({ type }) => type === "linkList");
  const formMonitorLink = form.links.find(({ type }) => type === "formMonitor");

  const { data: formMonitorStats, isLoading: isStatsLoading } =
    useFMFormStatsQuery(form.id, {
      enabled: formMonitor?.enabled === true,
    });

  return (
    <CardWrapper
      data-id={form.id}
      data-card-size={size}
      tabIndex={canMove ? 0 : undefined}
      aria-label={name}
      aria-describedby={canMove ? "form-card-move-help" : undefined}
      onKeyDown={(event) => {
        if (
          event.target === event.currentTarget &&
          event.altKey &&
          ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
            event.key,
          ) &&
          !isLayoutBusy
        ) {
          event.preventDefault();
          onKeyboardMove?.(id, event.key);
        }
      }}
      className={classes(
        isDisabled && "disabled",
        isSuccess && "archived",
        isDraggingInProgress && "dragging",
      )}
    >
      <Controls>
        {onResize && (
          <CardSizeMenu
            name={name}
            size={size}
            formId={id}
            content={content}
            fieldId={fieldId}
            canReadSubmissions={form.canManageSubmissions}
            monitorAvailable={!!formMonitor?.enabled && !!formMonitorLink}
            disabled={isLayoutBusy || isDisabled}
            onChange={onResize}
            onContentChange={onContentChange}
            onDuplicate={
              !isExpressEdition ? () => cloneMutation.mutate(id) : undefined
            }
            onArchive={
              !isExpressEdition && !dateArchived
                ? () => archiveMutation.mutate(id)
                : undefined
            }
            onDelete={canDelete ? () => openDeleteFormModal() : undefined}
          />
        )}
        <FormIcon svg={form.iconSvg || defaultFormIcon} color={color} />
      </Controls>

      <CardBody>
        <FormBody>
          <FormIdentity
            $hasBadge={hasBadge}
            $hasMenu={!!onResize}
            $hasMonitor={!!formMonitor?.enabled && !!formMonitorLink}
          >
            <FormBodyContent>
              {isTitleOverflowing ? (
                <Tooltip title={name} {...tooltipProps}>
                  {hasTitleLink ? (
                    <TitleLink
                      data-no-drag
                      ref={titleRef}
                      onClick={onNavigate}
                      onAuxClick={onNavigate}
                    >
                      {name}
                    </TitleLink>
                  ) : (
                    <Title ref={titleRef}>{name}</Title>
                  )}
                </Tooltip>
              ) : hasTitleLink ? (
                <TitleLink
                  data-no-drag
                  ref={titleRef}
                  onClick={onNavigate}
                  onAuxClick={onNavigate}
                >
                  {name}
                </TitleLink>
              ) : (
                <Title ref={titleRef}>{name}</Title>
              )}
              {!!description &&
                (isDescriptionOverflowing ? (
                  <Tooltip
                    title={description}
                    {...tooltipProps}
                    position="bottom"
                    distance={10}
                    style={{ display: "block" }}
                  >
                    <Subtitle data-card-description ref={descriptionRef}>
                      {description}
                    </Subtitle>
                  </Tooltip>
                ) : (
                  <Subtitle data-card-description ref={descriptionRef}>
                    {description}
                  </Subtitle>
                ))}

              {linkList.length > 0 && (
                <LinkList>
                  {linkList.map((link, idx) => (
                    <li key={idx}>
                      {!link.url ? (
                        <span>{link.label}</span>
                      ) : link.internal ? (
                        <NavLink to={link.url}>{link.label}</NavLink>
                      ) : (
                        <a href={link.url}>{link.label}</a>
                      )}
                    </li>
                  ))}
                </LinkList>
              )}
            </FormBodyContent>
          </FormIdentity>

          {formMonitor?.enabled && formMonitorLink && (
            <FMContainer className="corner-monitor">
              <NavLink to={formMonitorLink.url}>
                {isStatsLoading ? (
                  <FMLoading />
                ) : (
                  <FormMonitorStats
                    formMonitor={{
                      ...formMonitorStats,
                      enabled: formMonitor?.enabled,
                    }}
                    align="right"
                    width="100%"
                    showLastTest
                    size="sm"
                  />
                )}
              </NavLink>
            </FMContainer>
          )}
        </FormBody>
      </CardBody>

      {isTall && (content === "overview" || content === "statistics") && (
        <ExpandedStats>
          <div>
            <dt>{translate("Last {days} days", { days })}</dt>
            <dd>{stats?.total.toLocaleString() ?? "—"}</dd>
          </div>
          <div>
            <dt>{translate("vs. previous {days} days", { days })}</dt>
            <dd>
              <StatChange stats={stats} />
            </dd>
          </div>
        </ExpandedStats>
      )}
      {(isTall || isWide) &&
        form.canManageSubmissions &&
        (content === "field" ? (
          <CardFieldSummary
            id={id}
            fieldId={fieldId}
            days={days}
            compact={!isTall}
          />
        ) : content === "statistics" ? (
          <Activity className={!isTall ? "compact-details" : undefined}>
            {!isTall && (
              <p>
                <StatChange stats={stats} /> ·{" "}
                {translate("vs. previous {days} days", { days })}
              </p>
            )}
            <CardStatusSummary statuses={stats?.statuses} compact={!isTall} />
          </Activity>
        ) : content === "activity" || (content === "overview" && isTall) ? (
          <CardActivity id={id} days={days} compact={!isTall} />
        ) : null)}
      {isTall &&
        content === "monitor" &&
        formMonitor?.enabled &&
        formMonitorLink && (
          <Activity data-no-drag>
            <h3>{translate("Form Monitor")}</h3>
            <NavLink to={formMonitorLink.url}>
              {isStatsLoading ? (
                <FMLoading />
              ) : (
                <FormMonitorStats
                  formMonitor={{ ...formMonitorStats, enabled: true }}
                  align="left"
                  width="100%"
                  showLastTest
                  size="lg"
                />
              )}
            </NavLink>
          </Activity>
        )}
      {isTall && !form.canManageSubmissions && content !== "monitor" && (
        <Activity>
          <h3>{translate("Form details")}</h3>
          <dl>
            <dt>{translate("Handle")}</dt>
            <dd>{form.handle}</dd>
          </dl>
        </Activity>
      )}
      {(!isWide ||
        isTall ||
        content === "overview" ||
        (content === "statistics" && isTall) ||
        content === "monitor") && (
        <CardChart
          id={id}
          name={name}
          color={color}
          days={days}
          stats={stats}
          previewData={id === 0 ? form.chartData : undefined}
          hasPeriodSummary={
            isTall && (content === "overview" || content === "statistics")
          }
          expanded={isWide || isTall}
          tall={isTall}
        />
      )}
    </CardWrapper>
  );
};
