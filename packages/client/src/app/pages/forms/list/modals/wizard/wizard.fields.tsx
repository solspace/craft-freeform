import { InfoBlock } from "@components/notification-blocks/info/info-block";
import { useEventCallback } from "@ff-client/hooks/ts-hooks/use-event-callback";
import { useFetchFieldTypes } from "@ff-client/queries/field-types";
import translate from "@ff-client/utils/translations";
import DOMPurify from "dompurify";
import { Fragment, useEffect, useId, useRef, useState } from "react";
import Sortable from "sortablejs";
import { WizardFieldChoices } from "./wizard.field-choices";
import { WizardFieldInsert } from "./wizard.field-insert";
import {
  fieldRows,
  normalizeRows,
  placeField,
  type WizardField,
  type WizardOptions,
} from "./wizard.types";

export function WizardFields({
  fields,
  options,
  onChange,
  invalidFields,
  errorId,
}: {
  fields: WizardField[];
  options: WizardOptions;
  onChange: (fields: WizardField[]) => void;
  invalidFields?: ReadonlySet<string>;
  errorId?: string;
}) {
  const update = (key: string, changes: Partial<WizardField>) =>
    onChange(
      fields.map((field) =>
        field.key === key ? { ...field, ...changes } : field,
      ),
    );
  const canEdit = (field: WizardField, property: string) =>
    options.fieldTypes
      .find((type) => type.value === field.type)
      ?.editableProperties?.includes(property) ?? true;
  const list = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState<string>();
  const labelInput = useRef<HTMLInputElement>(null);
  const labelOriginal = useRef("");
  const { data: fieldTypes } = useFetchFieldTypes();
  useEffect(() => {
    if (editing) {
      labelInput.current?.focus();
      labelInput.current?.select();
    }
  }, [editing]);
  const rows = fieldRows(fields);
  const rowSignature = rows.map((row) => row[0].rowId).join("|");
  const instructionsId = useId();
  const rowInstructionsId = useId();
  const [announcement, setAnnouncement] = useState("");
  const canInsert =
    fields.length < options.fieldLimit && options.fieldTypes.length > 0;
  const insert = (
    type: string,
    rowId?: string,
    beforeKey?: string,
    newRowBefore?: string,
  ) => {
    if (!canInsert || !options.fieldTypes.some((item) => item.value === type))
      return;
    const current = normalizeRows(fields);
    if (rowId && current.filter((field) => field.rowId === rowId).length >= 4)
      return;
    const label = options.fieldTypes.find((item) => item.value === type)!.label;
    const field: WizardField = {
      key: `extra${crypto.randomUUID().replaceAll("-", "")}`,
      rowId: crypto.randomUUID(),
      type,
      label,
      required: false,
      width: ["textarea", "checkboxes", "rating", "file"].includes(type)
        ? "full"
        : "half",
      options: [translate("Option 1"), translate("Option 2")],
      instructions: "",
    };
    commitPlacement(
      placeField(
        [...current, field],
        field.key,
        rowId,
        beforeKey,
        newRowBefore,
      ),
    );
    labelOriginal.current = label;
    setEditing(field.key);
    setAnnouncement(translate("{label} added.", { label }));
  };
  const commitPlacement = useEventCallback((next: WizardField[]) => {
    const reducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const positions = new Map(
      Array.from(
        list.current?.querySelectorAll<HTMLElement>(".wizard-field-row") ?? [],
      ).map((row) => [row.dataset.layoutRowId, row.getBoundingClientRect()]),
    );
    onChange(next);
    if (reducedMotion) return;
    requestAnimationFrame(() => {
      for (const row of Array.from(
        list.current?.querySelectorAll<HTMLElement>(".wizard-field-row") ?? [],
      )) {
        const before = positions.get(row.dataset.layoutRowId);
        if (!before || typeof row.animate !== "function") continue;
        const after = row.getBoundingClientRect();
        const x = before.left - after.left,
          y = before.top - after.top;
        if (x || y)
          row.animate(
            [
              { transform: `translate(${x}px, ${y}px)` },
              { transform: "translate(0, 0)" },
            ],
            { duration: 180, easing: "ease" },
          );
      }
    });
  });
  const place = useEventCallback(
    (
      key: string,
      rowId?: string,
      beforeKey?: string,
      newRowBefore?: string,
    ) => {
      const next = placeField(fields, key, rowId, beforeKey, newRowBefore);
      commitPlacement(next);
      setAnnouncement(
        translate("{label} moved to position {position} of {count}.", {
          label: next.find((field) => field.key === key)?.label ?? "",
          position: next.findIndex((field) => field.key === key) + 1,
          count: next.length,
        }),
      );
    },
  );
  const move = (from: number, to: number) => {
    if (to < 0 || to >= fields.length || from === to) return;
    const ids = fields.map((field) => field.rowId);
    const next = [...fields];
    next.splice(to, 0, next.splice(from, 1)[0]);
    commitPlacement(
      next.map((field, index) => ({ ...field, rowId: ids[index] })),
    );
    setAnnouncement(
      translate("{label} moved to position {position} of {count}.", {
        label: fields[from].label,
        position: to + 1,
        count: fields.length,
      }),
    );
  };
  const moveRow = useEventCallback((rowId: string, to: number) => {
    const next = fieldRows(fields);
    const from = next.findIndex((row) => row[0].rowId === rowId);
    if (from < 0 || to < 0 || to >= next.length || from === to) return;
    next.splice(to, 0, next.splice(from, 1)[0]);
    onChange(next.flat());
    setAnnouncement(
      translate("Row moved to position {position} of {count}.", {
        position: to + 1,
        count: next.length,
      }),
    );
  });
  const focusRow = (rowId: string) =>
    requestAnimationFrame(() =>
      list.current
        ?.querySelector<HTMLButtonElement>(
          `[data-layout-row-id="${rowId}"] > .wizard-row-handle`,
        )
        ?.focus({ preventScroll: true }),
    );
  useEffect(() => {
    if (!list.current) return;
    let originalNext: ChildNode | null = null;
    const sortable = Sortable.create(list.current, {
      group: { name: `${instructionsId}-rows`, pull: false, put: false },
      direction: "vertical",
      animation: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
        ? 0
        : 180,
      handle: ".wizard-row-handle",
      draggable: ".wizard-field-row",
      ghostClass: "wizard-row-ghost",
      chosenClass: "wizard-row-chosen",
      forceFallback: true,
      fallbackOnBody: false,
      fallbackTolerance: 5,
      onStart: (event) => {
        originalNext = event.item.nextSibling;
      },
      onEnd: (event) => {
        const rowId = event.item.dataset.layoutRowId!;
        event.from.insertBefore(
          event.item,
          originalNext?.parentNode === event.from ? originalNext : null,
        );
        if (event.newDraggableIndex !== undefined)
          moveRow(rowId, event.newDraggableIndex);
        requestAnimationFrame(() =>
          event.item
            .querySelector<HTMLButtonElement>(".wizard-row-handle")
            ?.focus({ preventScroll: true }),
        );
      },
    });
    return () => {
      sortable.destroy();
    };
  }, [moveRow, instructionsId]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: Row lists must rebind when rows are added or removed.
  useEffect(() => {
    if (!list.current) return;
    let originalNext: ChildNode | null = null;
    let source: HTMLElement | null = null;
    let originalMinHeight = "";
    const restoreHeight = () => {
      if (source) source.style.minHeight = originalMinHeight;
      source = null;
    };
    let activeDrop: HTMLElement | null = null;
    const markDrop = (element: HTMLElement | null) => {
      if (activeDrop === element) return;
      if (activeDrop) delete activeDrop.dataset.dropActive;
      activeDrop = element;
      if (activeDrop) activeDrop.dataset.dropActive = "true";
    };
    const sortables = Array.from(
      list.current.querySelectorAll<HTMLOListElement>(
        ".wizard-row-fields, .wizard-new-row",
      ),
    ).map((element) =>
      Sortable.create(element, {
        group: {
          name: instructionsId,
          put: (to, from, dragged) => {
            const allowed =
              dragged.matches(".wizard-field-item") &&
              (to === from ||
                !to.el.dataset.rowId ||
                to.el.querySelectorAll(".wizard-field-item").length < 4);
            if (!allowed) markDrop(null);
            return allowed;
          },
        },
        animation: window.matchMedia?.("(prefers-reduced-motion: reduce)")
          .matches
          ? 0
          : 180,
        handle: ".wizard-field-handle",
        draggable: ".wizard-field-item",
        ghostClass: "wizard-field-ghost",
        chosenClass: "wizard-field-chosen",
        forceFallback: true,
        fallbackOnBody: false,
        fallbackTolerance: 5,
        emptyInsertThreshold: 6,
        onMove: (event) => {
          markDrop(event.to);
        },
        onUnchoose: () => {
          markDrop(null);
        },
        onStart: (event) => {
          originalNext = event.item.nextSibling;
          source = event.from;
          originalMinHeight = source.style.minHeight;
          if (source.classList.contains("wizard-row-fields"))
            source.style.minHeight = `${source.getBoundingClientRect().height}px`;
          markDrop(null);
        },
        onEnd: (event) => {
          const key = event.item.dataset.fieldKey!;
          const rowId = event.to.dataset.rowId;
          const beforeKey = (
            event.item.nextElementSibling as HTMLElement | null
          )?.dataset.fieldKey;
          const newRowBefore = event.to.dataset.newRowBefore;
          event.from.insertBefore(
            event.item,
            originalNext?.parentNode === event.from ? originalNext : null,
          );
          restoreHeight();
          markDrop(null);
          if (
            event.from !== event.to ||
            event.oldDraggableIndex !== event.newDraggableIndex
          )
            place(key, rowId, beforeKey, newRowBefore);
          requestAnimationFrame(() =>
            list.current
              ?.querySelector<HTMLButtonElement>(
                `[data-field-key="${key}"] .wizard-field-handle`,
              )
              ?.focus({ preventScroll: true }),
          );
        },
      }),
    );
    return () => {
      restoreHeight();
      markDrop(null);
      sortables.forEach((sortable) => {
        sortable.destroy();
      });
    };
  }, [place, rowSignature, instructionsId]);
  const gap = (before = "", number = rows.length + 1) => (
    <div className="wizard-row-gap">
      <ol
        className="wizard-new-row"
        data-new-row-before={before}
        aria-hidden="true"
      />
      {canInsert && (
        <div className="wizard-insert-row">
          <WizardFieldInsert
            label={
              rows.length
                ? translate(
                    before
                      ? "Insert field before row {number}"
                      : "Insert field after row {number}",
                    { number: before ? number : rows.length },
                  )
                : translate("Add field")
            }
            choices={options.fieldTypes}
            types={fieldTypes ?? []}
            onInsert={(type) => insert(type, undefined, undefined, before)}
          />
        </div>
      )}
    </div>
  );
  return (
    <>
      <div className="wizard-fields-info">
        <InfoBlock>
          {translate(
            "After creating your form, the builder gives you access to all available field types and settings.",
          )}
        </InfoBlock>
      </div>
      <p className="wizard-sr-only" id={instructionsId}>
        {translate(
          "Use Up and Down to reorder. Use Left or Right to join the previous or next row. Shift and Up moves a field into its own row.",
        )}
      </p>
      <p className="wizard-sr-only" id={rowInstructionsId}>
        {translate(
          "Use the outer arrow handle to move a whole row. You can also focus it and use Up, Down, Home, or End.",
        )}
      </p>
      <span className="wizard-sr-only" role="status" aria-live="polite">
        {announcement}
      </span>
      <div
        className="wizard-field-list"
        data-empty={rows.length === 0}
        data-invalid={invalidFields?.has("fields")}
        data-shared-rows={rows.some((row) => row.length > 1)}
        ref={list}
      >
        {rows.map((row, rowIndex) => (
          <Fragment key={row[0].rowId}>
            {gap(row[0].rowId, rowIndex + 1)}
            <div className="wizard-field-row" data-layout-row-id={row[0].rowId}>
              {row.length > 1 && (
                <button
                  type="button"
                  className="wizard-row-handle"
                  aria-label={translate("Reorder row {number}", {
                    number: rowIndex + 1,
                  })}
                  title={translate("Move entire row")}
                  aria-describedby={rowInstructionsId}
                  onKeyDown={(event) => {
                    const to =
                      event.key === "ArrowUp"
                        ? rowIndex - 1
                        : event.key === "ArrowDown"
                          ? rowIndex + 1
                          : event.key === "Home"
                            ? 0
                            : event.key === "End"
                              ? rows.length - 1
                              : undefined;
                    if (to !== undefined) {
                      event.preventDefault();
                      moveRow(row[0].rowId!, to);
                      focusRow(row[0].rowId!);
                    }
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M8 2v12M5 5l3-3 3 3M5 11l3 3 3-3" />
                  </svg>
                </button>
              )}
              <ol
                className="wizard-row-fields"
                data-row-id={row[0].rowId}
                aria-label={translate("Row {number}", { number: rowIndex + 1 })}
              >
                {row.map((field) => (
                  <li
                    className="wizard-field-item"
                    key={field.key}
                    data-field-key={field.key}
                    data-editing={editing === field.key}
                    data-invalid={
                      invalidFields?.has(`label:${field.key}`) ||
                      invalidFields?.has(`options:${field.key}`)
                    }
                  >
                    <button
                      type="button"
                      className="wizard-field-handle"
                      title={translate("Move this field")}
                      aria-label={translate("Reorder {label}", {
                        label: field.label,
                      })}
                      aria-describedby={instructionsId}
                      onKeyDown={(event) => {
                        const index = fields.findIndex(
                          (item) => item.key === field.key,
                        );
                        if (
                          [
                            "ArrowUp",
                            "ArrowDown",
                            "ArrowLeft",
                            "ArrowRight",
                            "Home",
                            "End",
                          ].includes(event.key)
                        ) {
                          event.preventDefault();
                          if (event.shiftKey && event.key === "ArrowUp")
                            place(
                              field.key,
                              undefined,
                              undefined,
                              row[0].rowId,
                            );
                          else if (
                            event.key === "ArrowLeft" ||
                            event.key === "ArrowRight"
                          ) {
                            const target =
                              rows[
                                rowIndex + (event.key === "ArrowLeft" ? -1 : 1)
                              ];
                            if (target) place(field.key, target[0].rowId);
                          } else
                            move(
                              index,
                              event.key === "Home"
                                ? 0
                                : event.key === "End"
                                  ? fields.length - 1
                                  : index + (event.key === "ArrowUp" ? -1 : 1),
                            );
                          requestAnimationFrame(() =>
                            list.current
                              ?.querySelector<HTMLButtonElement>(
                                `[data-field-key="${field.key}"] .wizard-field-handle`,
                              )
                              ?.focus({ preventScroll: true }),
                          );
                        }
                      }}
                    >
                      <svg
                        width="16"
                        height="18"
                        viewBox="0 0 16 18"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        {[4, 8, 12].map((y) => (
                          <g key={y}>
                            <circle cx="5" cy={y} r="1.3" />
                            <circle cx="11" cy={y} r="1.3" />
                          </g>
                        ))}
                      </svg>
                    </button>
                    <span
                      className="wizard-field-type-picker"
                      title={translate("Change field type")}
                    >
                      <span
                        aria-hidden="true"
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(
                            fieldTypes?.find((type) => type.type === field.type)
                              ?.icon ||
                              '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor"><rect x="1" y="3" width="14" height="10" rx="1"/></svg>',
                          ),
                        }}
                      />
                      <select
                        aria-label={translate("Field type for {label}", {
                          label: field.label,
                        })}
                        value={field.type}
                        onChange={(event) =>
                          update(field.key, {
                            type: event.target.value,
                            options: field.options.length
                              ? field.options
                              : [translate("Option 1"), translate("Option 2")],
                            instructions: "",
                            adapted: false,
                          })
                        }
                      >
                        {options.fieldTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </span>
                    {editing === field.key ? (
                      <input
                        ref={labelInput}
                        className="wizard-field-label-input"
                        aria-invalid={
                          invalidFields?.has(`label:${field.key}`) || undefined
                        }
                        aria-errormessage={
                          invalidFields?.has(`label:${field.key}`)
                            ? errorId
                            : undefined
                        }
                        aria-label={translate("Label")}
                        disabled={!canEdit(field, "label")}
                        value={field.label}
                        maxLength={200}
                        onChange={(event) =>
                          update(field.key, { label: event.target.value })
                        }
                        onBlur={() => setEditing(undefined)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === "Escape") {
                            event.preventDefault();
                            event.stopPropagation();
                            if (event.key === "Escape")
                              update(field.key, {
                                label: labelOriginal.current,
                              });
                            setEditing(undefined);
                          }
                        }}
                      />
                    ) : (
                      <button
                        type="button"
                        className="wizard-field-title"
                        disabled={!canEdit(field, "label")}
                        title={translate("Rename {label}", {
                          label: field.label,
                        })}
                        onClick={() => {
                          labelOriginal.current = field.label;
                          setEditing(field.key);
                        }}
                      >
                        <strong>
                          {field.label || translate("Untitled field")}
                        </strong>
                        <svg
                          className="wizard-field-pencil"
                          width="12"
                          height="12"
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          aria-hidden="true"
                        >
                          <path d="m3 10 8-8 3 3-8 8-4 1 1-4Z M9 4l3 3" />
                        </svg>
                      </button>
                    )}
                    <div className="wizard-field-tools">
                      {["dropdown", "radios", "checkboxes"].includes(
                        field.type,
                      ) && (
                        <WizardFieldChoices
                          invalid={invalidFields?.has(`options:${field.key}`)}
                          errorId={errorId}
                          field={field}
                          disabled={!canEdit(field, "optionConfiguration")}
                          onChange={(choices) =>
                            update(field.key, { options: choices })
                          }
                        />
                      )}
                      <button
                        type="button"
                        className="wizard-field-small-action wizard-field-required"
                        aria-label={translate("Required: {label}", {
                          label: field.label,
                        })}
                        aria-pressed={field.required}
                        title={translate(
                          field.required ? "Required field" : "Make required",
                        )}
                        disabled={!canEdit(field, "required")}
                        onClick={() =>
                          update(field.key, { required: !field.required })
                        }
                      >
                        *
                      </button>
                      <button
                        type="button"
                        className="wizard-field-small-action wizard-field-remove"
                        aria-label={translate("Remove {label}", {
                          label: field.label,
                        })}
                        title={translate("Remove field")}
                        onClick={() => {
                          if (editing === field.key) setEditing(undefined);
                          onChange(
                            fields.filter(
                              (current) => current.key !== field.key,
                            ),
                          );
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </li>
                ))}
              </ol>
              {canInsert && row.length < 4 && (
                <div className="wizard-row-inserts">
                  {[...row.map((field) => field.key), undefined].map(
                    (beforeKey, index) => (
                      <div
                        key={beforeKey ?? "end"}
                        className="wizard-inline-insert"
                        style={{ left: `${(index / row.length) * 100}%` }}
                      >
                        <WizardFieldInsert
                          label={translate(
                            beforeKey
                              ? "Insert field before {label}"
                              : "Insert field after {label}",
                            {
                              label: (beforeKey ? row[index] : row.at(-1))!
                                .label,
                            },
                          )}
                          choices={options.fieldTypes}
                          types={fieldTypes ?? []}
                          onInsert={(type) =>
                            insert(type, row[0].rowId, beforeKey)
                          }
                        />
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          </Fragment>
        ))}
        {gap()}
      </div>
    </>
  );
}
