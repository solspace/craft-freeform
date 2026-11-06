import { useEscapeStack } from "@ff-client/contexts/escape/escape.context";
import type { FormCardDays } from "@ff-client/types/forms";
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
  useListNavigation,
  useRole,
} from "@floating-ui/react";
import { useId, useRef, useState } from "react";
import styled from "styled-components";
import {
  ToolbarMenu,
  ToolbarMenuItem,
  ToolbarMenuTrigger,
} from "../../list-view.styles";

const periods: FormCardDays[] = [7, 30, 90];
const Menu = styled(ToolbarMenu)`
  width: 150px;
`;
const Choice = styled(ToolbarMenuItem)`
  svg { display: block; width: 18px; height: 18px; flex-shrink: 0; }
  .period-check { width: 14px; height: 14px; margin-inline-start: auto; }
`;

const PeriodIcon = ({ days }: { days: FormCardDays }) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {days === 90 ? (
      <>
        <path d="M8 2h12a2 2 0 0 1 2 2v12" />
        <rect x="2" y="6" width="16" height="16" rx="2" />
        <path d="M6 4v4M14 4v4M2 11h16M6 15h8M6 18h8" />
      </>
    ) : (
      <>
        <rect x="3" y="5" width="18" height="17" rx="2" />
        <path d="M7 3v4M17 3v4M3 10h18" />
        {days === 7 ? (
          <rect
            x="6"
            y="13"
            width="12"
            height="3"
            rx="1"
            fill="currentColor"
            stroke="none"
          />
        ) : (
          <path
            d="M7 14h.01M12 14h.01M17 14h.01M7 18h.01M12 18h.01M17 18h.01"
            strokeWidth="2.5"
          />
        )}
      </>
    )}
  </svg>
);

export const ChartPeriodMenu = ({
  days,
  disabled,
  busy,
  onChange,
}: {
  days: FormCardDays;
  disabled: boolean;
  busy: boolean;
  onChange: (days: FormCardDays) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const listRef = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIndex = periods.indexOf(days);
  const labelId = useId();
  useEscapeStack(() => setOpen(false), open);
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-start",
    strategy: "fixed",
    middleware: [offset(4), flip(), shift({ padding: 12 })],
    whileElementsMounted: autoUpdate,
  });
  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
    [
      useClick(context),
      useDismiss(context, { escapeKey: false }),
      useRole(context, { role: "menu" }),
      useListNavigation(context, {
        listRef,
        activeIndex,
        selectedIndex,
        onNavigate: setActiveIndex,
        focusItemOnOpen: true,
        loop: true,
      }),
    ],
  );
  return (
    <>
      <ToolbarMenuTrigger
        type="button"
        className="btn"
        ref={refs.setReference}
        aria-label={translate("Chart period")}
        aria-describedby={labelId}
        aria-busy={busy}
        disabled={disabled}
        {...getReferenceProps()}
      >
        <span id={labelId}>{translate("{days} days", { days })}</span>
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
          <FloatingFocusManager
            context={context}
            modal={false}
            initialFocus={-1}
          >
            <Menu
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps({ "aria-label": translate("Chart period") })}
            >
              <ul role="none">
                {periods.map((period, index) => (
                  <li key={period} role="none">
                    <Choice
                      type="button"
                      role="menuitemradio"
                      aria-checked={days === period}
                      disabled={disabled}
                      tabIndex={activeIndex === index ? 0 : -1}
                      ref={(element) => {
                        listRef.current[index] = element;
                      }}
                      {...getItemProps({
                        onClick: () => {
                          setOpen(false);
                          onChange(period);
                        },
                      })}
                    >
                      <PeriodIcon days={period} />
                      {translate("{days} days", { days: period })}
                      {days === period && (
                        <svg
                          className="period-check"
                          viewBox="0 0 16 16"
                          aria-hidden="true"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m3 8 3 3 7-7" />
                        </svg>
                      )}
                    </Choice>
                  </li>
                ))}
              </ul>
            </Menu>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
};
