import translate from "@ff-client/utils/translations";
import { createElement, useId } from "react";

export const EnvironmentBadge = ({
  boolean = false,
}: {
  boolean?: boolean;
}) => {
  const id = useId();
  const message = boolean
    ? "Choose an environment variable with a boolean value: yes/no, true/false, on/off, or 0/1."
    : "Type $ to choose an environment variable.";

  return (
    <>
      <button
        type="button"
        id={id}
        className="freeform-env-badge"
        aria-label={translate("Environment variable support")}
      >
        .ENV
      </button>
      {createElement(
        "craft-tooltip",
        { for: id, "invoker-relation": "description" },
        translate(message),
      )}
    </>
  );
};
