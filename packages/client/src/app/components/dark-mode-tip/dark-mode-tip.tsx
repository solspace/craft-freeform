import "@ff-dark-mode-tip-styles";

import config from "@config/freeform/freeform.config";
import translate from "@ff-client/utils/translations";
import {
  dismissDarkModeTip,
  isDarkModeTipDismissed,
  subscribeDarkModeTip,
} from "@ff-dark-mode-tip";
import axios from "axios";
import { useEffect, useState } from "react";

export const DarkModeTip = () => {
  const tip = config.metadata?.freeform?.darkModeTip;
  const [dismissed, setDismissed] = useState(() =>
    tip ? isDarkModeTipDismissed(tip.userKey) : false,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!tip?.visible) return;
    return subscribeDarkModeTip(tip.userKey, () => setDismissed(true));
  }, [tip?.visible, tip?.userKey]);

  if (!tip?.visible || dismissed) return null;
  const dismiss = async () => {
    setSaving(true);
    setError(false);
    try {
      await dismissDarkModeTip(tip.userKey, () => axios.post(tip.dismissUrl));
    } catch {
      setSaving(false);
      setError(true);
    }
  };

  return (
    <aside
      className="ff-dark-mode-tip"
      aria-label={translate("Prefer a darker workspace?")}
    >
      <span className="ff-dark-mode-tip-icon" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M20.5 13A8.5 8.5 0 0 1 11 3.5 8.5 8.5 0 1 0 20.5 13Z" />
        </svg>
      </span>
      <div className="ff-dark-mode-tip-copy">
        <h3>{translate("Prefer a darker workspace?")}</h3>
        <p>
          {translate(
            "darkMode by Solspace adds dark mode to Craft’s control panel, including Freeform. It’s free.",
          )}{" "}
          <a
            href="https://docs.solspace.com/craft/dark-mode/v1/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {translate("Explore darkMode")} &rarr;
          </a>
        </p>
        {error && (
          <p role="alert">
            {translate("Could not dismiss the tip. Please try again.")}
          </p>
        )}
      </div>
      <button
        type="button"
        className="ff-dark-mode-tip-dismiss"
        disabled={saving}
        onClick={dismiss}
        title={translate("Dismiss darkMode tip")}
        aria-label={translate("Dismiss darkMode tip")}
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="m4 4 8 8M12 4l-8 8" />
        </svg>
      </button>
    </aside>
  );
};
