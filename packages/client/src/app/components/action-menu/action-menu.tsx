import { useClickOutside } from "@ff-client/hooks/use-click-outside";
import { useOnKeypress } from "@ff-client/hooks/use-on-keypress";
import classes from "@ff-client/utils/classes";
import translate from "@ff-client/utils/translations";
import EllipsisIcon from "@ff-icons/actions/ellipsis.svg";
import type { FC } from "react";
import { useState } from "react";

import {
  ActionMenuButton,
  ActionMenuDropdown,
  ActionMenuItem,
  ActionMenuWrapper,
} from "./action-menu.styles";
import type { ActionMenuChoice } from "./action-menu.types";

type Props = {
  ariaLabel?: string;
  choices: ActionMenuChoice[];
};

export const ActionMenu: FC<Props> = ({
  choices,
  ariaLabel = translate("Actions"),
}) => {
  const [open, setOpen] = useState(false);

  // Close menu on Esc key press
  useOnKeypress({
    callback: (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    },
    meetsCondition: open,
    type: "keyup",
  });

  // Close menu on click outside
  const wrapperRef = useClickOutside<HTMLDivElement>({
    isEnabled: open,
    callback: () => setOpen(false),
  });

  return (
    <ActionMenuWrapper ref={wrapperRef}>
      <ActionMenuButton
        type="button"
        className={classes(open && "open")}
        onClick={() => setOpen((prev) => !prev)}
        aria-label={ariaLabel}
        aria-expanded={open}
        title={ariaLabel}
      >
        <EllipsisIcon />
      </ActionMenuButton>

      {open && (
        <ActionMenuDropdown>
          {choices.map((choice) => (
            <ActionMenuItem
              key={choice.label}
              type="button"
              className={choice.className}
              $destructive={choice.destructive}
              onClick={() => {
                setOpen(false);
                choice.onClick();
              }}
            >
              {choice.icon}
              <span>{choice.label}</span>
            </ActionMenuItem>
          ))}
        </ActionMenuDropdown>
      )}
    </ActionMenuWrapper>
  );
};
