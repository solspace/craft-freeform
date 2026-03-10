import type React from "react";

type Props = {
  value: string;
  updateValue: (value: string) => void;
};

export const WysiwygPlain: React.FC<Props> = ({ value, updateValue }) => {
  return (
    <input
      className="input text fullwidth"
      type="text"
      value={value}
      onChange={(event) => updateValue(event.target.value)}
    />
  );
};
