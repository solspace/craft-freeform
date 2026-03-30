import { usePosition } from "@components/form-controls/preview/previewable-component.hooks";
import { LoadingText } from "@components/loaders/loading-text/loading-text";
import { useClickOutside } from "@ff-client/hooks/use-click-outside";
import classes from "@ff-client/utils/classes";
import type React from "react";
import { useRef, useState } from "react";

import { ButtonGroupWrapper } from "../button-group/button-group.styles";
import { PopUpPortal } from "../pop-up-portal";

import { ChoiceWrapper } from "./button-choices.styles";

type Choice = {
  label: string;
  url?: string;
  onClick?: () => void;
};

type Props = Choice & {
  loading?: boolean;
  loadingText?: string;
  choices?: Choice[];
};

export const ButtonChoices: React.FC<Props> = ({
  label,
  onClick,
  loading,
  loadingText,
  choices,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);

  useClickOutside({
    isEnabled: open,
    callback: () => {
      setOpen(false);
    },
    refObject: dropdownRef,
  });

  const { left, top } = usePosition(
    wrapperRef.current,
    dropdownRef.current,
    open,
  );

  return (
    <ButtonGroupWrapper ref={wrapperRef} className="btngroup submit">
      <button
        type="button"
        className={classes("btn", "submit", "add", "icon")}
        onClick={onClick}
      >
        <LoadingText spinner loading={loading} loadingText={loadingText}>
          {label}
        </LoadingText>
      </button>

      {!!choices?.length && (
        <button
          type="button"
          className="btn submit menubtn btngroup-btn-last"
          onClick={() => {
            setOpen((prev) => !prev);
          }}
        />
      )}

      <PopUpPortal>
        {open && (
          <ChoiceWrapper
            ref={dropdownRef}
            style={{ left: left - 146, top: top + 34 }}
          >
            <ul>
              {choices?.map((choice, index) => (
                <li key={index}>
                  <a
                    href={choice.url}
                    onClick={() => {
                      choice.onClick();
                      setOpen(false);
                    }}
                  >
                    {choice.label}
                  </a>
                </li>
              ))}
            </ul>
          </ChoiceWrapper>
        )}
      </PopUpPortal>
    </ButtonGroupWrapper>
  );
};
