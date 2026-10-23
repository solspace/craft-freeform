import config, { Edition } from "@config/freeform/freeform.config";
import { useFetchFormGroups } from "@ff-client/queries/form-groups";
import type { FormCardDays, FormWithStats } from "@ff-client/types/forms";
import classes from "@ff-client/utils/classes";
import translate from "@ff-client/utils/translations";
import DOMPurify from "dompurify";
import type React from "react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { FormSearchProps } from "../../form-search";
import { createFormSearch } from "../../form-search.utils";
import { ViewButtons } from "../../list-view.styles";
import { useFormLimitModal } from "../../modals/hooks/use-add-form-modal";
import { Notices } from "../../notices/notices";
import { Archived } from "./archived/archived";
import { Card } from "./card/card";
import { CardLoading } from "./card/card.loading";
import { CardPreview } from "./card/card.preview";
import { useCardStats } from "./card/card.queries";
import { WidgetCard } from "./card/card.widget";
import { GridEmpty } from "./grid.empty";
import { useCardRange } from "./grid.range";
import { useCardSizing } from "./grid.sizing";
import { useDashboardSorting } from "./grid.sortable";
import {
  ArchivedAndGroupWrapper,
  Cards,
  CardWrapper,
  ContentContainer,
  GroupTitle,
  GroupWrap,
  Wrapper,
} from "./grid.styles";
import {
  type DashboardWidget,
  mergeWidgetCards,
  useDashboardWidgets,
} from "./grid.widgets";

export const FormGrid: React.FC<
  FormSearchProps & { periodHost?: HTMLElement | null }
> = ({ search = "", periodHost }) => {
  const openFormLimit = useFormLimitModal();
  const { data, isFetching } = useFetchFormGroups();
  const isSearching = search.trim().length > 0;
  const sizing = useCardSizing();
  const range = useCardRange(data?.cardRange);
  const widgets = useDashboardWidgets();
  const stats = useCardStats(range.days, !!data);
  const sorting = useDashboardSorting(
    data,
    !isSearching && !sizing.isSaving && !range.isSaving && !widgets.isSaving,
    { items: widgets.items, save: widgets.save, reload: widgets.reload },
  );
  const matchesSearch = createFormSearch(search);
  const forms = data?.forms?.filter(matchesSearch);
  const groups = data?.formGroups?.groups.map((group) => ({
    ...group,
    forms: group.forms?.filter(matchesSearch),
  }));
  const archivedForms = data?.archivedForms?.filter(matchesSearch);

  const groupWidgets = (uid: string | null) =>
    isSearching
      ? []
      : widgets.items.filter((widget) => {
          const group = groups?.some((group) => group.uid === widget.groupUid)
            ? widget.groupUid
            : null;
          return group === uid;
        });
  const mixedItems = (forms: FormWithStats[] = [], uid: string | null) =>
    mergeWidgetCards(forms, groupWidgets(uid));
  const isForms = (forms?.length ?? 0) > 0;
  const isGroups = groups?.some((group) => (group?.forms?.length ?? 0) > 0);
  const isEmpty =
    !isFetching &&
    !isForms &&
    !isGroups &&
    !(widgets.items.length && !isSearching);

  const isExpressEdition = config.editions.is(Edition.Express);
  const isProEdition = config.editions.isAtLeast(Edition.Pro);

  const renderItem = (item: FormWithStats | DashboardWidget) => {
    if ("beforeId" in item)
      return (
        <WidgetCard
          key={item.uid}
          widget={item}
          siteId={widgets.siteId}
          disabled={
            widgets.isSaving ||
            sorting.isSaving ||
            sizing.isSaving ||
            range.isSaving ||
            sorting.isDragging
          }
          onResize={(size) => void widgets.resize(item, size).catch(() => {})}
          onRemove={() => void widgets.remove(item.uid).catch(() => {})}
          onKeyboardMove={sorting.onKeyboardMove}
        />
      );
    const form = item as FormWithStats;
    return (
      <Card
        isDraggingInProgress={sorting.isDragging}
        canMove={sorting.canMoveForms}
        onKeyboardMove={sorting.onKeyboardMove}
        isExpressEdition={isExpressEdition}
        key={form.id}
        form={form}
        size={sizing.getSize(form)}
        days={range.days}
        stats={stats.data?.forms[form.id]}
        content={sizing.getContent(form)}
        fieldId={sizing.getFieldId(form)}
        onContentChange={(content, fieldId) =>
          void sizing.setContent(form, content, fieldId)
        }
        onResize={(size) => void sizing.resize(form, size)}
        isLayoutBusy={
          widgets.isSaving ||
          range.isSaving ||
          sizing.isSaving ||
          sorting.isSaving ||
          sorting.isDragging
        }
      />
    );
  };

  useEffect(() => {
    document.title = translate("Forms");
  }, []);

  return (
    <ContentContainer>
      <div id="content" className="content-pane">
        <Notices />

        <Wrapper>
          <span id="form-card-move-help" className="visually-hidden">
            {translate(
              "Hold an empty area of a card to drag. Focus a card and use Alt + up/down arrows to reorder, or Alt + left/right to change group.",
            )}
          </span>
          {periodHost &&
            data &&
            createPortal(
              <ViewButtons
                className="btngroup btngroup--exclusive"
                aria-label={translate("Chart period")}
                aria-busy={stats.isFetching}
              >
                {([7, 30, 90] as FormCardDays[]).map((days) => (
                  <button
                    key={days}
                    type="button"
                    className={classes("btn", range.days === days && "active")}
                    aria-pressed={range.days === days}
                    disabled={
                      range.isSaving ||
                      sizing.isSaving ||
                      sorting.isSaving ||
                      sorting.isDragging
                    }
                    onClick={() => void range.change(days)}
                  >
                    {translate("{days} days", { days })}
                  </button>
                ))}
              </ViewButtons>,
              periodHost,
            )}
          {widgets.isError && (
            <p role="status">
              {translate("Could not load widgets.")}{" "}
              <button
                type="button"
                className="btn small"
                onClick={() => void widgets.refetch()}
              >
                {translate("Try again")}
              </button>
            </p>
          )}
          {!isEmpty && stats.isError && (
            <p role="status">
              {translate("Could not load charts.")}{" "}
              <button
                className="btn small"
                type="button"
                onClick={() => void stats.refetch()}
              >
                {translate("Try again")}
              </button>
            </p>
          )}
          {isEmpty && !isSearching && <GridEmpty />}
          {isEmpty && isSearching && !archivedForms?.length && (
            <p role="status">{translate("No forms match your search.")}</p>
          )}
          {!isEmpty && (
            <CardWrapper
              ref={sorting.wrapperRef}
              $dragging={sorting.isDragging}
              aria-busy={sorting.isSaving}
            >
              {isProEdition &&
                groups?.map((group) =>
                  (group?.forms?.length ?? 0) ||
                  groupWidgets(group.uid).length ||
                  sorting.canMove ? (
                    <GroupWrap key={group.uid}>
                      <GroupTitle>{group.label}</GroupTitle>
                      <Cards
                        data-form-group={group.uid}
                        aria-label={group.label}
                        $empty={translate("Drag forms here.")}
                      >
                        {mixedItems(group.forms, group.uid).map(renderItem)}
                      </Cards>
                    </GroupWrap>
                  ) : null,
                )}
              {/* Keep the empty drop target mounted so Sortable can register it before dragging. */}
              {data &&
                !isEmpty &&
                (isForms ||
                  groupWidgets(null).length > 0 ||
                  sorting.canMove) && (
                  <GroupWrap
                    hidden={
                      !isForms &&
                      !groupWidgets(null).length &&
                      !sorting.isDragging
                    }
                  >
                    {data?.formGroups?.groups.length > 0 && (
                      <GroupTitle>{translate("Other")}</GroupTitle>
                    )}

                    <Cards
                      data-form-group=""
                      aria-label={translate("Other")}
                      $empty={translate("Drag forms here.")}
                    >
                      {mixedItems(forms, null).map(renderItem)}
                      {isExpressEdition && !isSearching && (
                        <>
                          <CardPreview />
                          <CardPreview />
                        </>
                      )}
                    </Cards>
                  </GroupWrap>
                )}
              {!data?.forms && isFetching && (
                <Cards>
                  <CardLoading />
                  <CardLoading />
                  <CardLoading />
                </Cards>
              )}
            </CardWrapper>
          )}

          {isExpressEdition && (
            <div
              onClick={(event) => {
                if (
                  event.target instanceof Element &&
                  event.target.closest("a")
                ) {
                  event.preventDefault();
                  openFormLimit();
                }
              }}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  translate(
                    'Need more forms? <a href="{link}" target="_blank">Upgrade to Lite or Pro</a>.',
                    { link: Craft.getCpUrl("plugin-store/freeform") },
                  ),
                ),
              }}
            />
          )}

          <ArchivedAndGroupWrapper>
            {!isExpressEdition && archivedForms && (
              <Archived data={archivedForms} />
            )}
          </ArchivedAndGroupWrapper>
        </Wrapper>
      </div>
    </ContentContainer>
  );
};
