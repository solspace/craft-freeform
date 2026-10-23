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
  const supportsContent = size !== "1x1";
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
      {open && !disabled && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <SizeMenu
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps({ "aria-label": translate("Card options") })}
            >
              <span>{translate("Card size")}</span>
              {sizeChoices.map((choice) => (
                <SizeChoice
                  key={choice.size}
                  type="button"
                  aria-pressed={choice.size === size}
                  onClick={() => {
                    setOpen(false);
                    choice.onSelect();
                  }}
                >
                  <span>{translate(choice.label)}</span>
                  <span>{choice.dimensions}</span>
                </SizeChoice>
              ))}
              {supportsContent && onContentChange && (
                <div className="content-options">
                  <label>
                    {translate("Card content")}
                    <div className="card-select">
                      <select
                        value={content}
                        onChange={(event) =>
                          act(() =>
                            onContentChange(
                              event.target.value as FormCardContent,
                              event.target.value === "field"
                                ? fields.data?.[0]?.id
                                : null,
                            ),
                          )
                        }
                      >
                        <option value="overview">
                          {translate("Overview")}
                        </option>
                        {canReadSubmissions && (
                          <>
                            <option value="activity">
                              {translate("Recent activity")}
                            </option>
                            <option value="statistics">
                              {translate("Statistics and statuses")}
                            </option>
                          </>
                        )}
                        {monitorAvailable && (
                          <option value="monitor">
                            {translate("Form Monitor")}
                          </option>
                        )}
                        {(!!fields.data?.length || content === "field") && (
                          <option value="field">
                            {translate("Field summary")}
                          </option>
                        )}
                      </select>
                    </div>
                  </label>
                  {content === "field" && (
                    <label>
                      {translate("Summary field")}
                      <div className="card-select">
                        <select
                          value={fieldId ?? ""}
                          onChange={(event) =>
                            act(() =>
                              onContentChange(
                                "field",
                                Number(event.target.value),
                              ),
                            )
                          }
                        >
                          <option value="" disabled>
                            {translate("Choose a field")}
                          </option>
                          {fields.data?.map((field) => (
                            <option key={field.id} value={field.id}>
                              {field.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </label>
                  )}
                  {fields.isError && (
                    <button type="button" onClick={() => void fields.refetch()}>
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
                    <SizeChoice type="button" onClick={() => act(onEditWidget)}>
                      {translate("Widget settings")}
                    </SizeChoice>
                  )}
                  {onRemoveWidget && (
                    <SizeChoice
                      type="button"
                      className="delete-action"
                      onClick={() => act(onRemoveWidget)}
                    >
                      <DeleteIcon />
                      {translate("Remove widget")}
                    </SizeChoice>
                  )}
                  {onDuplicate && (
                    <SizeChoice type="button" onClick={() => act(onDuplicate)}>
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
                      className="delete-action"
                      type="button"
                      onClick={() => act(onDelete)}
                    >
                      <DeleteIcon />
                      {translate("Delete")}
                    </SizeChoice>
                  )}
                </div>
              )}
            </SizeMenu>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
};
