import type { OptionCollection } from "@ff-client/types/properties";
import classes from "@ff-client/utils/classes";
import type React from "react";
import type { ReactNode } from "react";

import { Button, ButtonGroupWrapper } from "./button-group.styles";

type Props = {
  label?: string;
  small?: boolean;
  value: string;
  options: OptionCollection;
  onClick: (value: string) => void;
};

export const ButtonGroup: React.FC<Props> = ({
  value,
  options,
  onClick,
  label,
  small,
}) => {
  const elements: ReactNode[] = [];

  options.forEach((option, idx) => {
    if ("value" in option) {
      elements.push(
        <Button
          type="button"
          aria-pressed={option.value === value}
          key={idx}
          className={classes(option.value === value && "active")}
          onClick={() => onClick(option.value)}
        >
          <span>{option.label}</span>
        </Button>,
      );
    }
  });

  return (
    <ButtonGroupWrapper
      role="group"
      aria-label={label}
      $compact={elements.length >= 4}
      $small={small}
    >
      {elements}
    </ButtonGroupWrapper>
  );
};
