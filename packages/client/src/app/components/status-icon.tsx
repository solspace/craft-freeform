import statusIcons from "../../../../plugin/src/Resources/icons/status.svg?url&no-inline";
import "../../../../styles/src/shared/status.css";

export const StatusIcon = ({
  level,
}: {
  level: "error" | "warning" | "notice" | "success";
}) => (
  <svg
    className="ff-status-icon"
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <use href={`${statusIcons}#${level}`} />
  </svg>
);
