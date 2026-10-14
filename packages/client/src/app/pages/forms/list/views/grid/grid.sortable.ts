import config, { Edition } from "@config/freeform/freeform.config";
import { useSiteContext } from "@ff-client/contexts/site/site.context";
import { QKGroups } from "@ff-client/queries/form-groups";
import { QKForms } from "@ff-client/queries/forms";
import type { FormWithGroup } from "@ff-client/types/form-groups";
import translate from "@ff-client/utils/translations";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import Sortable from "sortablejs";
import { type CardMove, keyboardMove, moveCard } from "./grid.order";

export const useDashboardSorting = (data?: FormWithGroup) => {
  const queryClient = useQueryClient();
  const { current, getCurrentHandleWithFallback } = useSiteContext();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const [isDragging, setDragging] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [isError, setError] = useState(false);
  const canMove =
    config.metadata.freeform.canOrganizeForms &&
    !config.editions.is(Edition.Express);

  const save = async (move: CardMove, restoreFocus = false) => {
    if (!data || busy.current || !canMove) return;
    busy.current = true;
    setSaving(true);
    setError(false);
    setNotice(translate("Saving form position…"));
    const key = QKGroups.all(getCurrentHandleWithFallback());
    await queryClient.cancelQueries({ queryKey: key });
    const previous = queryClient.getQueryData<FormWithGroup>(key);
    queryClient.setQueryData(key, moveCard(data, move));
    try {
      await axios.post("/api/forms/groups/move", {
        ...move,
        siteId: data.formGroups?.siteId ?? current?.id,
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: key }),
        queryClient.invalidateQueries({ queryKey: QKForms.base }),
      ]);
      setNotice(translate("Form position saved."));
    } catch {
      queryClient.setQueryData(key, previous);
      setError(true);
      setNotice(
        translate("Could not save the form position. Please try again."),
      );
    } finally {
      busy.current = false;
      setSaving(false);
      if (restoreFocus)
        requestAnimationFrame(() => {
          wrapperRef.current
            ?.querySelector<HTMLButtonElement>(
              `[data-id="${move.formId}"] .handle`,
            )
            ?.focus({ preventScroll: true });
        });
    }
  };
  const saveRef = useRef(save);
  saveRef.current = save;

  useEffect(() => {
    if (!canMove || !data || !wrapperRef.current) return;
    let originalNext: ChildNode | null = null;
    const instances = Array.from(
      wrapperRef.current.querySelectorAll<HTMLElement>("[data-form-group]"),
    ).map(
      (list) =>
        new Sortable(list, {
          group: "freeform-dashboard-cards",
          handle: ".handle",
          draggable: "[data-id]",
          animation: 180,
          ghostClass: "card-drop-placeholder",
          chosenClass: "card-chosen",
          dragClass: "card-moving",
          emptyInsertThreshold: 35,
          disabled: isSaving || busy.current,
          onMove: () => !busy.current,
          onStart: (event) => {
            originalNext = event.item.nextSibling;
            setDragging(true);
          },
          onEnd: (event) => {
            const beforeId =
              event.item.nextElementSibling?.getAttribute("data-id");
            const move = {
              formId: Number(event.item.dataset.id),
              groupUid: event.to.dataset.formGroup || null,
              beforeId: beforeId ? Number(beforeId) : null,
            };
            // Sortable changes the DOM. Restore it before React applies the new data.
            event.from.insertBefore(event.item, originalNext);
            setDragging(false);
            if (
              event.from === event.to &&
              event.oldDraggableIndex === event.newDraggableIndex
            )
              return;
            instances.forEach((instance) => {
              instance.option("disabled", true);
            });
            void saveRef.current(move);
          },
        }),
    );
    return () => {
      instances.forEach((instance) => {
        instance.destroy();
      });
    };
  }, [data, canMove, isSaving]);

  const onKeyboardMove = (formId: number, key: string) => {
    if (!data) return;
    const move = keyboardMove(data, formId, key);
    if (move) void save(move, true);
  };

  return {
    wrapperRef,
    isDragging,
    isSaving,
    notice,
    isError,
    canMove,
    onKeyboardMove,
  };
};
