import config from "@config/freeform/freeform.config";
import classes from "@ff-client/utils/classes";
import type { FC } from "react";

import { LightSwitchHandle, LightSwitchWrapper } from "./lightswitch.styles";

type Props = {
  enabled?: boolean;
  readOnly?: boolean;
  errors?: string[];
  onClick?: (enabled: boolean) => void;
};

export const LightSwitch: FC<Props> = ({
  enabled,
  readOnly,
  errors,
  onClick,
}) => {
  const { is: craftVersion } = config.metadata.craft;

  return (
    <LightSwitchWrapper
      className={classes(
        enabled && "on",
        errors && "error",
        readOnly && "readonly",
        craftVersion.atLeast("5.8.0") && "craft-5_8",
      )}
      onClick={() => {
        if (readOnly) {
          return;
        }

        onClick?.(!enabled);
      }}
    >
      <LightSwitchHandle />
    </LightSwitchWrapper>
  );
};
