import translate from "@ff-client/utils/translations";
import type { FC } from "react";
import { EnvLine as EnvTip } from "../bool-env/env.line";

export const EnvLine: FC = () => (
  <EnvTip>
    <span>
      <span
        dangerouslySetInnerHTML={{
          __html: translate(
            "Type <kbd>$</kbd> to choose an environment variable.",
          ),
        }}
      />{" "}
      <a
        href="https://craftcms.com/docs/5.x/configure.html#control-panel-settings"
        target="_blank"
        rel="noopener noreferrer"
        data-external-link=""
      >
        {translate("Learn more")}
      </a>
    </span>
  </EnvTip>
);
