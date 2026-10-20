import translate from "@ff-client/utils/translations";
import type React from "react";
import { useEffect, useRef, useState } from "react";

import {
  ColorInput,
  HexInput,
  InputRow,
  TransparencyToggle,
} from "./hex-color-input.styles";

type Props = {
  value?: string | null;
  onChange: (value: string) => void;
  allowTransparent?: boolean;
};

const FALLBACK_HEX = "#000000";

export const HexColorInput: React.FC<Props> = ({
  value,
  onChange,
  allowTransparent = false,
}) => {
  const [draft, setDraft] = useState(() => getDisplayValue(value));
  const solidColor = useRef(normalizeHex(value) || FALLBACK_HEX);
  const transparent = isTransparent(value);

  useEffect(() => {
    setDraft(getDisplayValue(value));
    const hex = normalizeHex(value);
    if (hex) solidColor.current = hex;
  }, [value]);

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.currentTarget.value.toLowerCase();
    setDraft(nextValue);
    onChange(nextValue);
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.currentTarget.value;
    const normalizedValue =
      allowTransparent && nextValue.trim().toLowerCase() === "transparent"
        ? "rgba(0,0,0,0)"
        : normalizeHex(nextValue);

    if (normalizedValue) {
      setDraft(getDisplayValue(normalizedValue));
      onChange(normalizedValue);

      return;
    }

    setDraft(nextValue);
  };

  const handleBlur = () => {
    setDraft(getDisplayValue(value));
  };

  return (
    <InputRow>
      <ColorInput
        type="color"
        value={normalizeHex(value) || solidColor.current}
        data-transparent={transparent}
        aria-label={translate("Choose color")}
        onChange={handleColorChange}
      />
      <HexInput
        type="text"
        value={draft}
        maxLength={64}
        aria-label={translate("Color value")}
        placeholder="#RRGGBB"
        spellCheck={false}
        onBlur={handleBlur}
        onChange={handleTextChange}
      />
      {allowTransparent && (
        <TransparencyToggle>
          <input
            type="checkbox"
            checked={transparent}
            onChange={(event) => {
              const nextValue = event.currentTarget.checked
                ? "rgba(0,0,0,0)"
                : solidColor.current;
              setDraft(getDisplayValue(nextValue));
              onChange(nextValue);
            }}
          />
          <span>{translate("Transparent")}</span>
        </TransparencyToggle>
      )}
    </InputRow>
  );
};

const expandShortHex = (value: string): string =>
  `#${value
    .slice(1)
    .split("")
    .map((character) => character.repeat(2))
    .join("")}`;

const normalizeHex = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  const prefixed = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;

  if (/^#[0-9a-f]{3}$/i.test(prefixed)) {
    return expandShortHex(prefixed).toLowerCase();
  }

  if (/^#[0-9a-f]{6}$/i.test(prefixed)) {
    return prefixed.toLowerCase();
  }

  return null;
};

const isTransparent = (value?: string | null): boolean => {
  const color = value?.trim() || "";
  return (
    /^transparent$/i.test(color) ||
    /^rgba\(\s*[^,]+,\s*[^,]+,\s*[^,]+,\s*0(?:\.0+)?%?\s*\)$/i.test(color)
  );
};

const getDisplayValue = (value?: string | null): string =>
  isTransparent(value)
    ? translate("Transparent")
    : normalizeHex(value) || value?.trim() || "";
