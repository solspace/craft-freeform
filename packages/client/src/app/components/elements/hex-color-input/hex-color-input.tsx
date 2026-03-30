import type React from "react";
import { useEffect, useState } from "react";

import { ColorInput, HexInput, InputRow } from "./hex-color-input.styles";

type Props = {
  value?: string | null;
  onChange: (value: string) => void;
};

const FALLBACK_HEX = "#000000";

export const HexColorInput: React.FC<Props> = ({ value, onChange }) => {
  const [draft, setDraft] = useState(() => getDisplayValue(value));

  useEffect(() => {
    setDraft(getDisplayValue(value));
  }, [value]);

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.currentTarget.value.toLowerCase();
    setDraft(nextValue);
    onChange(nextValue);
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.currentTarget.value;
    const normalizedValue = normalizeHex(nextValue);

    if (normalizedValue) {
      setDraft(normalizedValue);
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
        value={getDisplayValue(value)}
        onChange={handleColorChange}
      />
      <HexInput
        type="text"
        value={draft}
        maxLength={7}
        placeholder="#RRGGBB"
        spellCheck={false}
        onBlur={handleBlur}
        onChange={handleTextChange}
      />
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

const getDisplayValue = (value?: string | null): string =>
  normalizeHex(value) || FALLBACK_HEX;
