import { useEscapeStack } from "@ff-client/contexts/escape/escape.context";
import type { FormWithStats } from "@ff-client/types/forms";
import translate from "@ff-client/utils/translations";
import EllipsisIcon from "@ff-icons/actions/ellipsis";
import MoveIcon from "@ff-icons/actions/move";
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
import {
  FormColor,
  MoveButton,
  MoveChoice,
  MoveMenu,
  Name,
  Wrapper,
} from "./modal.list-item.styles";

type Props = {
  form: FormWithStats;
  destinations: { uid: string | null; label: string }[];
  disabled: boolean;
  onMove: (id: number, uid: string | null) => void;
};

export const FormItem = ({ form, destinations, disabled, onMove }: Props) => {
  const [open, setOpen] = useState(false);
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
    useClick(context),
    useDismiss(context, { escapeKey: false }),
    useRole(context, { role: "dialog" }),
  ]);

  return (
    <Wrapper data-id={form.id} className="form-group-item">
      <FormColor $color={form.settings.general.color} aria-hidden="true" />
      <MoveIcon className="form-grip" aria-hidden="true" />
      <Name title={form.name}>{form.name}</Name>
      <MoveButton
        type="button"
        ref={refs.setReference}
        disabled={disabled || !destinations.length}
        {...getReferenceProps({
          "aria-label": translate("Move {name}", { name: form.name }),
          title: translate("Move form"),
        })}
      >
        <EllipsisIcon />
      </MoveButton>
      {open && !disabled && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <MoveMenu
              ref={refs.setFloating}
              style={floatingStyles}
              className="dropdown-rollout"
              {...getFloatingProps({
                "aria-label": translate("Move {name} to", { name: form.name }),
              })}
            >
              <span>{translate("Move to")}</span>
              {destinations.map(({ uid, label }) => (
                <MoveChoice
                  key={uid || "unassigned"}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onMove(form.id, uid);
                  }}
                >
                  {label}
                </MoveChoice>
              ))}
            </MoveMenu>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </Wrapper>
  );
};
