import type { OptionCollection } from "@ff-client/types/properties";
import classes from "@ff-client/utils/classes";
import translate from "@ff-client/utils/translations";
import type { FC } from "react";
import { useCallback, useState } from "react";

import type { Option } from "../../options.types";

import { BulkButton } from "./custom.editor.styles";

enum State {
  Idle,
  Copied,
}

type Props = {
  options: OptionCollection;
  copyValues?: boolean;
};

export const CopyToClipboardButton: FC<Props> = ({ options, copyValues }) => {
  const [state, setState] = useState<State>(State.Idle);

  const copyToClipboard = useCallback(() => {
    return options
      .map(({ label, value, optgroup }: Option) => {
        const parts: string[] = [];

        if (optgroup) {
          parts.push("@@");
        }

        parts.push(label);

        if (copyValues) {
          parts.push(`|${value}`);
        }

        return parts.join("");
      })
      .join("\n");
  }, [options, copyValues]);

  return (
    <BulkButton
      onClick={() => {
        navigator.clipboard.writeText(copyToClipboard());
        setState(State.Copied);
        setTimeout(() => setState(State.Idle), 2000);
      }}
    >
      <i
        className={classes(
          state === State.Idle && "fa-classic fa-copy",
          state === State.Copied && "fa-classic fa-check",
        )}
      />
      <span>
        {translate(state === State.Idle ? "Copy to clipboard" : "Copied")}
      </span>
    </BulkButton>
  );
};
