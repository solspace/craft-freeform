import "../../../../../../styles/src/cp/color-picker/color-picker.css";
import translate from "@ff-client/utils/translations";
import type React from "react";
import { useEffect, useRef } from "react";
import { mountColorPicker } from "../../../../../../scripts/src/lib/color-picker";

type Props = {
  value?: string | null;
  onChange: (value: string) => void;
  allowTransparent?: boolean;
  allowInherited?: boolean;
  transparentLabel?: string;
  disabled?: boolean;
  ariaLabel?: string;
  ariaInvalid?: boolean;
  errorId?: string;
};

export const HexColorInput: React.FC<Props> = ({
  value,
  onChange,
  allowTransparent = false,
  allowInherited = false,
  transparentLabel = "Transparent",
  disabled = false,
  ariaLabel,
  ariaInvalid,
  errorId,
}) => {
  const host = useRef<HTMLDivElement>(null);
  const picker = useRef<ReturnType<typeof mountColorPicker> | null>(null);
  const latestValue = useRef(value);
  latestValue.current = value;
  const change = useRef(onChange);
  change.current = onChange;
  useEffect(() => {
    if (!host.current) return;
    picker.current = mountColorPicker(host.current, {
      value: latestValue.current,
      allowTransparent,
      allowInherited,
      transparentLabel,
      ariaLabel,
      translate,
      onChange: (next) => change.current(next),
    });
    return () => {
      picker.current?.destroy();
      picker.current = null;
    };
  }, [allowTransparent, allowInherited, transparentLabel, ariaLabel]);
  useEffect(() => {
    picker.current?.update({
      value: value ?? "",
      disabled,
      ariaInvalid,
      errorId,
    });
  }, [value, disabled, ariaInvalid, errorId]);
  return <div ref={host} />;
};
