import { useEscapeStack } from "@ff-client/contexts/escape/escape.context";
import {
  autoUpdate,
  FloatingFocusManager,
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
import { type ReactNode, useRef, useState } from "react";
import styled from "styled-components";
import { ToolbarMenu, ToolbarMenuItem } from "../../../list-view.styles";

type Choice = { value: string; label: string; icon?: ReactNode };
const Wrapper = styled.div`position: relative; margin-top: 5px;`;
const Trigger = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  height: var(--ui-control-height, 34px);
  padding-inline: 10px;
  .picker-label { display: inline-flex; align-items: center; gap: 8px; min-width: 0; }
  .picker-label > span { overflow: hidden; text-overflow: ellipsis; }
  svg { display: block; flex-shrink: 0; width: 16px; height: 16px; }
  .picker-chevron { width: 12px; height: 12px; }
`;
const Menu = styled(ToolbarMenu)`
  z-index: 1101;
  width: 250px;
`;
const Item = styled(ToolbarMenuItem)`
  > span { overflow: hidden; text-overflow: ellipsis; }
  svg { display: block; flex-shrink: 0; width: 18px; height: 18px; }
  .picker-check { width: 14px; height: 14px; margin-inline-start: auto; }
`;

export const CardPicker = ({
  label,
  value,
  choices,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  choices: Choice[];
  placeholder?: string;
  onChange: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const listRef = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIndex = choices.findIndex((choice) => choice.value === value);
  const selected = choices[selectedIndex];
  useEscapeStack(() => setOpen(false), open);
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-start",
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
        selectedIndex: selectedIndex < 0 ? null : selectedIndex,
        onNavigate: setActiveIndex,
        focusItemOnOpen: true,
        loop: true,
      }),
    ],
  );
  return (
    <Wrapper>
      <Trigger
        type="button"
        className="btn"
        ref={refs.setReference}
        aria-label={label}
        {...getReferenceProps()}
      >
        <span className="picker-label">
          {selected?.icon}
          <span>{selected?.label || placeholder}</span>
        </span>
        <svg
          className="picker-chevron"
          viewBox="0 0 12 12"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m2 4 4 4 4-4" />
        </svg>
      </Trigger>
      {open && (
        <FloatingFocusManager context={context} modal={false} initialFocus={-1}>
          <Menu
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps({ "aria-label": label })}
          >
            <ul role="none">
              {choices.map((choice, index) => (
                <li key={choice.value} role="none">
                  <Item
                    type="button"
                    role="menuitemradio"
                    aria-checked={value === choice.value}
                    tabIndex={activeIndex === index ? 0 : -1}
                    ref={(element) => {
                      listRef.current[index] = element;
                    }}
                    {...getItemProps({
                      onClick: () => {
                        setOpen(false);
                        onChange(choice.value);
                      },
                    })}
                  >
                    {choice.icon}
                    <span>{choice.label}</span>
                    {value === choice.value && (
                      <svg
                        className="picker-check"
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
                  </Item>
                </li>
              ))}
            </ul>
          </Menu>
        </FloatingFocusManager>
      )}
    </Wrapper>
  );
};

export const CardContentIcon = ({ content }: { content: string }) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {content === "overview" && (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 9v12" />
      </>
    )}
    {content === "activity" && (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l4 2" />
      </>
    )}
    {content === "statistics" && (
      <path d="M3 3v18h18M7 17v-5M12 17V7M17 17V4" />
    )}
    {content === "monitor" && (
      <>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M5 12h3l2-5 4 10 2-5h3" />
      </>
    )}
    {content === "field" && (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M7 8h2M12 8h5M7 12h2M12 12h5M7 16h2M12 16h5" />
      </>
    )}
  </svg>
);
