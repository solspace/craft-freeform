import config, { Edition } from "@config/freeform/freeform.config";
import { useSiteContext } from "@ff-client/contexts/site/site.context";
import { QKGroups } from "@ff-client/queries/form-groups";
import { QKForms } from "@ff-client/queries/forms";
import type { FormWithGroup } from "@ff-client/types/form-groups";
import { notifications } from "@ff-client/utils/notifications";
import translate from "@ff-client/utils/translations";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import Sortable from "sortablejs";
import { createGridDropTargets } from "./grid.drop-gaps";
import { type CardMove, keyboardMove, moveCard } from "./grid.order";
import type {
  DashboardWidget,
  WidgetList,
  WidgetPlacement,
} from "./grid.widgets";
import { placementsFromLists } from "./grid.widgets";

export const useDashboardSorting = (
  data?: FormWithGroup,
  enabled = true,
  widgets?: {
    items: DashboardWidget[];
    save: (placements: WidgetPlacement[]) => Promise<void>;
    reload: () => Promise<void>;
  },
) => {
  const queryClient = useQueryClient();
  const { current, getCurrentHandleWithFallback } = useSiteContext();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const [isDragging, setDragging] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const canMoveForms =
    enabled &&
    config.metadata.freeform.canOrganizeForms &&
    config.editions.isAtLeast(Edition.Pro);
  const canMove =
    enabled &&
    config.editions.isAtLeast(Edition.Pro) &&
    (canMoveForms || !!widgets?.items.length);

  const save = async (
    move: CardMove,
    restoreFocus = false,
    placements?: WidgetPlacement[],
  ) => {
    if (!data || busy.current || !canMoveForms) return;
    busy.current = true;
    setSaving(true);
    const key = QKGroups.all(getCurrentHandleWithFallback());
    await queryClient.cancelQueries({ queryKey: key });
    const previous = queryClient.getQueryData<FormWithGroup>(key);
    queryClient.setQueryData(key, moveCard(data, move));
    try {
      await axios.post("/api/forms/groups/move", {
        ...move,
        siteId: data.formGroups?.siteId ?? current?.id,
        ...(placements ? { widgets: placements } : {}),
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: key }),
        queryClient.invalidateQueries({ queryKey: QKForms.base }),
        ...(placements && widgets ? [widgets.reload()] : []),
      ]);
      notifications.success(translate("Form position saved."));
    } catch {
      queryClient.setQueryData(key, previous);
      notifications.error(
        translate("Could not save the form position. Please try again."),
      );
    } finally {
      busy.current = false;
      setSaving(false);
      if (restoreFocus)
        requestAnimationFrame(() => {
          wrapperRef.current
            ?.querySelector<HTMLElement>(`[data-id="${move.formId}"]`)
            ?.focus({ preventScroll: true });
        });
    }
  };
  const widgetSave = async (
    placements: WidgetPlacement[],
    focusId?: string,
  ) => {
    if (busy.current || !widgets || !enabled) return;
    busy.current = true;
    setSaving(true);
    try {
      await widgets.save(placements);
    } catch {
      /* The widget hook reports failures. */
    } finally {
      busy.current = false;
      setSaving(false);
      if (focusId)
        requestAnimationFrame(() =>
          wrapperRef.current
            ?.querySelector<HTMLElement>(`[data-id="${focusId}"]`)
            ?.focus({ preventScroll: true }),
        );
    }
  };
  const lists = useCallback(
    (): WidgetList[] =>
      Array.from(
        wrapperRef.current?.querySelectorAll<HTMLElement>(
          "[data-form-group]",
        ) ?? [],
      ).map((list) => ({
        groupUid: list.dataset.formGroup || null,
        ids: Array.from(
          list.querySelectorAll<HTMLElement>(":scope > [data-id]"),
        ).map((item) => item.dataset.id),
      })),
    [],
  );
  const widgetSaveRef = useRef(widgetSave);
  widgetSaveRef.current = widgetSave;
  const saveRef = useRef(save);
  saveRef.current = save;

  useEffect(() => {
    if (!canMove || !data || !wrapperRef.current) return;
    let originalNext: ChildNode | null = null;
    let originalIndex = 0;
    let gapTargets: ReturnType<typeof createGridDropTargets> | undefined;
    const groupLists = Array.from(
      wrapperRef.current.querySelectorAll<HTMLElement>("[data-form-group]"),
    );
    const instances = groupLists.map(
      (list) =>
        new Sortable(list, {
          group: "freeform-dashboard-cards",
          delay: 220,
          delayOnTouchOnly: false,
          touchStartThreshold: 10,
          fallbackTolerance: 5,
          forceFallback: true,
          fallbackOnBody: true,
          fallbackClass: "card-drag-preview",
          filter:
            "a, button, input, select, textarea, [role=button], [role=dialog], [data-no-drag], [data-grid-gap]",
          preventOnFilter: false,
          draggable: canMoveForms
            ? "[data-id], [data-grid-gap]"
            : '[data-id^="widget-"], [data-grid-gap]',
          animation: 180,
          ghostClass: "card-drop-placeholder",
          chosenClass: "card-chosen",
          dragClass: "card-moving",
          emptyInsertThreshold: 35,
          disabled: isSaving || busy.current,
          onMove: (event) =>
            busy.current
              ? false
              : event.related?.hasAttribute("data-grid-gap")
                ? -1
                : true,
          onStart: (event) => {
            originalNext = event.item.nextSibling;
            originalIndex = Array.from(
              event.from.querySelectorAll(":scope > [data-id]"),
            ).indexOf(event.item);
            gapTargets = createGridDropTargets(groupLists, event.item);
            setDragging(true);
          },
          onEnd: (event) => {
            gapTargets?.destroy();
            gapTargets = undefined;
            const mixedLists = lists();
            const targetList = mixedLists.find(
              (list) => list.groupUid === (event.to.dataset.formGroup || null),
            );
            const targetIndex = targetList.ids.indexOf(event.item.dataset.id);
            const beforeId = targetList.ids
              .slice(targetIndex + 1)
              .find((id) => /^\d+$/.test(id));
            const placements = widgets?.items.length
              ? placementsFromLists(mixedLists, widgets.items)
              : undefined;
            const move = {
              formId: Number(event.item.dataset.id),
              groupUid: event.to.dataset.formGroup || null,
              beforeId: beforeId ? Number(beforeId) : null,
            };
            // Sortable changes the DOM. Restore it before React applies the new data.
            event.from.insertBefore(event.item, originalNext);
            setDragging(false);
            if (event.from === event.to && originalIndex === targetIndex)
              return;
            instances.forEach((instance) => {
              instance.option("disabled", true);
            });
            if (event.item.dataset.id.startsWith("widget-")) {
              if (placements) void widgetSaveRef.current(placements);
            } else void saveRef.current(move, false, placements);
          },
        }),
    );
    return () => {
      gapTargets?.destroy();
      instances.forEach((instance) => {
        instance.destroy();
      });
    };
  }, [data, canMove, canMoveForms, isSaving, widgets?.items, lists]);

  const onKeyboardMove = (formId: number | string, key: string) => {
    if (
      !data ||
      !canMove ||
      (!String(formId).startsWith("widget-") && !canMoveForms)
    )
      return;
    if (widgets?.items.length) {
      const currentLists = lists();
      const groupIndex = currentLists.findIndex((list) =>
        list.ids.includes(String(formId)),
      );
      if (groupIndex < 0) return;
      const source = currentLists[groupIndex];
      const index = source.ids.indexOf(String(formId));
      let target = source;
      let targetIndex = index;
      if (key === "ArrowUp") targetIndex = Math.max(0, index - 1);
      else if (key === "ArrowDown")
        targetIndex = Math.min(source.ids.length - 1, index + 1);
      else {
        target = currentLists[groupIndex + (key === "ArrowLeft" ? -1 : 1)];
        if (!target) return;
        targetIndex = target.ids.length;
      }
      source.ids.splice(index, 1);
      target.ids.splice(targetIndex, 0, String(formId));
      const placements = placementsFromLists(currentLists, widgets.items);
      if (String(formId).startsWith("widget-"))
        void widgetSave(placements, String(formId));
      else {
        const beforeId = target.ids
          .slice(targetIndex + 1)
          .find((id) => /^\d+$/.test(id));
        void save(
          {
            formId: Number(formId),
            groupUid: target.groupUid,
            beforeId: beforeId ? Number(beforeId) : null,
          },
          true,
          placements,
        );
      }
      return;
    }
    const move = keyboardMove(data, Number(formId), key);
    if (move) void save(move, true);
  };

  return {
    wrapperRef,
    isDragging,
    isSaving,
    canMove,
    canMoveForms,
    onKeyboardMove,
  };
};
