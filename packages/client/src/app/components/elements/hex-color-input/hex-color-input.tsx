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
  allowInherited?: boolean;
  transparentLabel?: string;
};

const FALLBACK_HEX = "#000000";

export const HexColorInput: React.FC<Props> = ({
  value,
  onChange,
  allowTransparent = false,
  allowInherited = false,
  transparentLabel = "Transparent",
}) => {
  const [draft, setDraft] = useState(() =>
    getDisplayValue(value, allowInherited, transparentLabel),
  );
  const solidColor = useRef(normalizeHex(value) || FALLBACK_HEX);
  const transparent = isTransparent(value);
  const inherited =
    allowInherited && (!value || value.toLowerCase() === "currentcolor");

  useEffect(() => {
    setDraft(getDisplayValue(value, allowInherited, transparentLabel));
    const hex = normalizeHex(value);
    if (hex) solidColor.current = hex;
  }, [value, allowInherited, transparentLabel]);

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.currentTarget.value.toLowerCase();
    setDraft(nextValue);
    onChange(nextValue);
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.currentTarget.value;
    const normalizedValue =
      allowInherited &&
      ["inherit", "inherited", "currentcolor"].includes(
        nextValue.trim().toLowerCase(),
      )
        ? "currentColor"
        : allowTransparent &&
            ["transparent", transparentLabel.toLowerCase()].includes(
              nextValue.trim().toLowerCase(),
            )
          ? "rgba(0,0,0,0)"
          : normalizeHex(nextValue);

    if (normalizedValue) {
      setDraft(
        getDisplayValue(normalizedValue, allowInherited, transparentLabel),
      );
      onChange(normalizedValue);

      return;
    }

    setDraft(nextValue);
  };

  const handleBlur = () => {
    setDraft(getDisplayValue(value, allowInherited, transparentLabel));
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
              setDraft(
                getDisplayValue(nextValue, allowInherited, transparentLabel),
              );
              onChange(nextValue);
            }}
          />
          <span>{translate(transparentLabel)}</span>
        </TransparencyToggle>
      )}
      {allowInherited && (
        <TransparencyToggle>
          <input
            type="checkbox"
            checked={inherited}
            onChange={(event) => {
              const nextValue = event.currentTarget.checked
                ? "currentColor"
                : solidColor.current;
              setDraft(getDisplayValue(nextValue, true, transparentLabel));
              onChange(nextValue);
            }}
          />
          <span>{translate("Inherit")}</span>
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

const getDisplayValue = (
  value?: string | null,
  allowInherited = false,
  transparentLabel = "Transparent",
): string =>
  allowInherited && (!value || value.toLowerCase() === "currentcolor")
    ? translate("Inherited")
    : isTransparent(value)
      ? translate(transparentLabel)
      : normalizeHex(value) || value?.trim() || "";
