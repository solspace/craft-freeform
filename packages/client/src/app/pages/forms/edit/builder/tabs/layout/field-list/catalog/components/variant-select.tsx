import { CurrentValue } from "@components/elements/custom-dropdown/dropdown.styles";
import { borderRadius, colors } from "@ff-client/styles/variables";
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
  useTypeahead,
} from "@floating-ui/react";
import type React from "react";
import { useId, useRef, useState } from "react";
import styled from "styled-components";

const Trigger = styled(CurrentValue).attrs({ as: "button", type: "button" })`
  width: 100%; min-width: 0; border: 0; color: ${colors.gray700}; font: inherit; font-size: 12px; line-height: 20px; text-align: left;
  > span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  &:focus-visible { box-shadow: var(--focus-ring); outline: none; }
`;
const Listbox = styled.div`
  z-index: 10; min-width: 100%; padding: 4px; border: 1px solid ${colors.gray100}; border-radius: ${borderRadius.md}; background: ${colors.white}; box-shadow: 0 6px 20px rgb(32 51 72 / 18%); max-height: 180px; overflow-y: auto;
`;
const Option = styled.button`
  display: flex; align-items: center; gap: 7px; width: 100%; min-height: 30px; border: 0; border-radius: 3px; padding: 5px 8px; background: transparent; color: ${colors.gray700}; font: inherit; font-size: 12px; line-height: 20px; text-align: left; white-space: nowrap; cursor: pointer;
  &[aria-selected='true'] { font-weight: 600; }
  &[data-active='true'], &:hover { background: #edf2fc; color: #2856a3; }
  &:focus { outline: none; }
  &:focus-visible { box-shadow: inset 0 0 0 2px #5782ef; }
  svg { width: 12px; height: 12px; flex: 0 0 12px; }
`;
export const VariantSelect: React.FC<{
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}> = ({ label, value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const listRef = useRef<Array<HTMLElement | null>>([]);
  const labelsRef = useRef<Array<string | null>>([]);
  labelsRef.current = options.map((option) => option.label);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const id = useId();
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-start",
    middleware: [offset(4), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });
  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
    [
      useClick(context),
      useDismiss(context, { bubbles: false }),
      useListNavigation(context, {
        listRef,
        activeIndex,
        selectedIndex,
        onNavigate: setActiveIndex,
        loop: true,
      }),
      useTypeahead(context, {
        listRef: labelsRef,
        activeIndex,
        onMatch: setActiveIndex,
        enabled: open,
      }),
    ],
  );
  return (
    <div style={{ position: "relative", minWidth: 0, flex: 1 }}>
      <Trigger
        ref={refs.setReference}
        {...getReferenceProps()}
        role="combobox"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? id : undefined}
      >
        <span>{options[selectedIndex]?.label}</span>
      </Trigger>
      {open && (
        <FloatingFocusManager context={context} modal={false} initialFocus={-1}>
          <Listbox
            id={id}
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            role="listbox"
            aria-label={label}
          >
            {options.map((option, index) => (
              <Option
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === value}
                data-active={activeIndex === index}
                tabIndex={activeIndex === index ? 0 : -1}
                ref={(element) => {
                  listRef.current[index] = element;
                }}
                {...getItemProps({
                  onClick: () => {
                    onChange(option.value);
                    setOpen(false);
                  },
                })}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ opacity: option.value === value ? 1 : 0 }}
                >
                  <path d="m3 8 3 3 7-7" />
                </svg>
                {option.label}
              </Option>
            ))}
          </Listbox>
        </FloatingFocusManager>
      )}
    </div>
  );
};
