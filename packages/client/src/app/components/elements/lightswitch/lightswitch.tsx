import config from "@config/freeform/freeform.config";
import classes from "@ff-client/utils/classes";
import { createElement, type FC, useEffect, useRef } from "react";

import { LightSwitchHandle, LightSwitchWrapper } from "./lightswitch.styles";

type Props = {
  id?: string;
  label?: string;
  enabled?: boolean;
  readOnly?: boolean;
  errors?: string[];
  onClick?: (enabled: boolean) => void;
};

type CraftSwitchElement = HTMLElement & {
  checked: boolean;
  turnOn: (muteEvent?: boolean) => void;
  turnOff: (muteEvent?: boolean) => void;
};

const NativeLightSwitch: FC<Props> = ({
  id,
  label,
  enabled = false,
  readOnly,
  errors,
  onClick,
}) => {
  const ref = useRef<CraftSwitchElement>(null);
  const current = useRef({ enabled, readOnly, onClick });
  current.current = { enabled, readOnly, onClick };

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const onChange = () => {
      const props = current.current;
      if (!props.readOnly && element.checked !== props.enabled) {
        props.onClick?.(element.checked);
      }
    };
    element.addEventListener("change", onChange);
    return () => element.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void customElements.whenDefined("craft-switch").then(() => {
      if (cancelled || !ref.current) {
        return;
      }
      // Prop changes (including undo/redo) must not notify the form again.
      if (enabled) {
        ref.current.turnOn(true);
      } else {
        ref.current.turnOff(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return createElement(
    "craft-switch",
    {
      ref,
      disabled: readOnly || undefined,
      "aria-invalid": errors?.length ? true : undefined,
    },
    createElement("craft-switch-button", {
      slot: "input",
      id,
      role: "switch",
      "aria-label": label,
      "aria-checked": enabled,
      "data-tag-name": "craft-switch-button",
    }),
  );
};

export const LightSwitch: FC<Props> = ({
  id,
  label,
  enabled,
  readOnly,
  errors,
  onClick,
}) => {
  const { is: craftVersion } = config.metadata.craft;

  if (craftVersion.atLeast("6.0.0")) {
    return (
      <NativeLightSwitch
        id={id}
        label={label}
        enabled={enabled}
        readOnly={readOnly}
        errors={errors}
        onClick={onClick}
      />
    );
  }

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
