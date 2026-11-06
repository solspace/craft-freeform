import { useEscapeStack } from "@ff-client/contexts/escape/escape.context";
import translate from "@ff-client/utils/translations";
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
import styled from "styled-components";
import {
  ToolbarMenu,
  ToolbarMenuItem,
  ToolbarMenuTrigger,
} from "../../../list-view.styles";

const choices = [
  {
    type: "linear",
    label: "Linear Chart",
    path: "M3 3v18h18M6 15l4-5 4 3 6-8",
  },
  {
    type: "radial",
    label: "Radial Chart",
    path: "M12 3a9 9 0 1 0 9 9h-9V3Zm4 0v5h5a9 9 0 0 0-5-5Z",
  },
  {
    type: "recent",
    label: "Recent Submissions",
    path: "M8 5h13M8 12h13M8 19h13M3 5h.01M3 12h.01M3 19h.01",
  },
  {
    type: "quick-form",
    label: "Quick Form",
    path: "M4 3h16v18H4ZM8 7h8M8 11h8M8 15h4",
  },
] as const;

const Choice = styled(ToolbarMenuItem)`
  svg { display: block; width: 20px; height: 20px; flex-shrink: 0; }
`;

export const WidgetTypeMenu = ({
  onSelect,
}: {
  onSelect: (type: string) => void;
}) => {
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
    <>
      <ToolbarMenuTrigger
        type="button"
        className="btn"
        aria-label={translate("Insert widget")}
        ref={refs.setReference}
        {...getReferenceProps()}
      >
        <svg
          viewBox="0 0 12 12"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        >
          <path d="M6 1v10M1 6h10" />
        </svg>
        {translate("Widgets")}
        <svg
          viewBox="0 0 12 12"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m2 4 4 4 4-4" />
        </svg>
      </ToolbarMenuTrigger>
      {open && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <ToolbarMenu
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps({
                "aria-label": translate("Insert widget"),
              })}
            >
              <ul>
                {choices.map(({ type, label, path }) => (
                  <li key={type}>
                    <Choice
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        onSelect(type);
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d={path} />
                      </svg>
                      {translate(label)}
                    </Choice>
                  </li>
                ))}
              </ul>
            </ToolbarMenu>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
};
