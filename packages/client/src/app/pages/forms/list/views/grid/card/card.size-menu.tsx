import { useEscapeStack } from "@ff-client/contexts/escape/escape.context";
import type {
  DashboardWidgetSize,
  FormCardContent,
  FormCardSize,
} from "@ff-client/types/forms";
import translate from "@ff-client/utils/translations";
import ArchiveIcon from "@ff-icons/actions/archive";
import CloneIcon from "@ff-icons/actions/clone";
import DeleteIcon from "@ff-icons/actions/delete";
import EllipsisIcon from "@ff-icons/actions/ellipsis";
import {
  autoUpdate,
  FloatingFocusManager,
  FloatingPortal,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { useState } from "react";
import { CardContentIcon, CardPicker } from "./card.picker";
import { useCardFields } from "./card.queries";
import { ControlButton, SizeChoice, SizeMenu } from "./card.styles";

const sizes: { size: FormCardSize; label: string; dimensions: string }[] = [
  { size: "1x1", label: "Standard", dimensions: "1×1" },
  { size: "2x1", label: "Wide", dimensions: "2×1" },
  { size: "1x2", label: "Tall", dimensions: "1×2" },
  { size: "2x2", label: "Large", dimensions: "2×2" },
];

export const CardSizeMenu = ({
  name,
  canCustomize = true,
  size,
  disabled,
  onChange,
  extraSizes = [],
  formId = 0,
  content = "overview",
  fieldId,
  canReadSubmissions = false,
  monitorAvailable = false,
  onContentChange,
  onDuplicate,
  onArchive,
  onDelete,
  onEditWidget,
  onRemoveWidget,
}: {
  name: string;
  canCustomize?: boolean;
  size: DashboardWidgetSize;
  disabled: boolean;
  onChange: (size: FormCardSize) => void;
  extraSizes?: {
    size: DashboardWidgetSize;
    label: string;
    dimensions: string;
    onSelect: () => void;
  }[];
  formId?: number;
  content?: FormCardContent;
  fieldId?: number | null;
  canReadSubmissions?: boolean;
  monitorAvailable?: boolean;
  onContentChange?: (content: FormCardContent, fieldId?: number | null) => void;
  onDuplicate?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onEditWidget?: () => void;
  onRemoveWidget?: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const sizeChoices = [
    ...sizes.map((choice) => ({
      ...choice,
      onSelect: () => onChange(choice.size),
    })),
    ...extraSizes,
  ];
  const supportsContent = canCustomize && size !== "1x1";
  const fields = useCardFields(
    formId,
    open && supportsContent && canReadSubmissions && !!onContentChange,
  );
  const act = (callback: () => void) => {
    setOpen(false);
    callback();
  };
  useEscapeStack(() => setOpen(false), open);
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-end",
    strategy: "fixed",
    middleware: [offset(4), flip(), shift({ padding: 12 })],
    whileElementsMounted: autoUpdate,
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context, { enabled: !disabled }),
    useDismiss(context, { escapeKey: false }),
    useRole(context, { role: "dialog" }),
  ]);
  return (
    <>
      <ControlButton
        type="button"
        ref={refs.setReference}
        aria-disabled={disabled}
        {...getReferenceProps({
          "aria-label": translate("Card options for {name}", { name }),
          title: translate("Card options"),
        })}
      >
        <EllipsisIcon />
      </ControlButton>
      {open && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <SizeMenu
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps({ "aria-label": translate("Card options") })}
            >
              <fieldset className="menu-controls" disabled={disabled}>
                {canCustomize && <span>{translate("Card size")}</span>}
                {canCustomize &&
                  sizeChoices.map((choice) => (
                    <SizeChoice
                      key={choice.size}
                      type="button"
                      className={choice.size === size ? "sel" : undefined}
                      aria-pressed={choice.size === size}
                      onClick={() => {
                        setOpen(false);
                        choice.onSelect();
                      }}
                    >
                      <span className="size-label">
                        <svg
                          className="size-check"
                          viewBox="0 0 16 16"
                          aria-hidden="true"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          {choice.size === size && <path d="m3 8 3 3 7-7" />}
                        </svg>
                        {translate(choice.label)}
                      </span>
                      <span>{choice.dimensions}</span>
                    </SizeChoice>
                  ))}
                {supportsContent && onContentChange && (
                  <div className="content-options">
                    <label>
                      {translate("Card content")}
                      <CardPicker
                        label={translate("Card content")}
                        value={content}
                        choices={[
                          { value: "overview", label: translate("Overview") },
                          ...(canReadSubmissions
                            ? [
                                {
                                  value: "activity",
                                  label: translate("Recent activity"),
                                },
                                {
                                  value: "statistics",
                                  label: translate("Statistics and statuses"),
                                },
                              ]
                            : []),
                          ...(monitorAvailable
                            ? [
                                {
                                  value: "monitor",
                                  label: translate("Form Monitor"),
                                },
                              ]
                            : []),
                          ...(fields.data?.length || content === "field"
                            ? [
                                {
                                  value: "field",
                                  label: translate("Field summary"),
                                },
                              ]
                            : []),
                        ].map((choice) => ({
                          ...choice,
                          icon: <CardContentIcon content={choice.value} />,
                        }))}
                        onChange={(next) => {
                          if (next === content) return;
                          if (next === "field") {
                            onContentChange("field", fields.data?.[0]?.id);
                          } else {
                            act(() =>
                              onContentChange(next as FormCardContent, null),
                            );
                          }
                        }}
                      />
                    </label>
                    {content === "field" && (
                      <label>
                        {translate("Summary field")}
                        <CardPicker
                          label={translate("Summary field")}
                          value={String(fieldId ?? "")}
                          placeholder={translate("Choose a field")}
                          choices={(fields.data || []).map((field) => ({
                            value: String(field.id),
                            label: field.label,
                          }))}
                          onChange={(next) =>
                            act(() => {
                              if (Number(next) !== fieldId)
                                onContentChange("field", Number(next));
                            })
                          }
                        />
                      </label>
                    )}
                    {fields.isError && (
                      <button
                        type="button"
                        onClick={() => void fields.refetch()}
                      >
                        {translate("Retry summary fields")}
                      </button>
                    )}
                  </div>
                )}
                {(onDuplicate ||
                  onArchive ||
                  onDelete ||
                  onEditWidget ||
                  onRemoveWidget) && (
                  <div className="card-actions">
                    {onEditWidget && (
                      <SizeChoice
                        type="button"
                        onClick={() => act(onEditWidget)}
                      >
                        {translate("Widget settings")}
                      </SizeChoice>
                    )}
                    {onRemoveWidget && (
                      <SizeChoice
                        type="button"
                        className="error"
                        onClick={() => act(onRemoveWidget)}
                      >
                        <DeleteIcon />
                        {translate("Remove widget")}
                      </SizeChoice>
                    )}
                    {onDuplicate && (
                      <SizeChoice
                        type="button"
                        onClick={() => act(onDuplicate)}
                      >
                        <CloneIcon />
                        {translate("Duplicate")}
                      </SizeChoice>
                    )}
                    {onArchive && (
                      <SizeChoice type="button" onClick={() => act(onArchive)}>
                        <ArchiveIcon />
                        {translate("Archive")}
                      </SizeChoice>
                    )}
                    {onDelete && (
                      <SizeChoice
                        className="error"
                        type="button"
                        onClick={() => act(onDelete)}
                      >
                        <DeleteIcon />
                        {translate("Delete")}
                      </SizeChoice>
                    )}
                  </div>
                )}
              </fieldset>
            </SizeMenu>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
};
