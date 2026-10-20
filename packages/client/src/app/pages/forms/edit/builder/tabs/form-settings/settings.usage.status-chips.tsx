import classes from "@ff-client/utils/classes";
import translate from "@ff-client/utils/translations";
import { useState } from "react";

type StatusItem = {
  key: string | number;
  name: string;
  enabled: boolean;
  type?: string;
};

export const ConfigurationStatusChips = ({
  id,
  label,
  items,
}: {
  id: string;
  label: string;
  items: StatusItem[];
}) => {
  const [showDisabled, setShowDisabled] = useState(false);
  const enabledItems = items.filter((item) => item.enabled);
  const disabledItems = items.filter((item) => !item.enabled);
  const visibleItems = showDisabled
    ? [...enabledItems, ...disabledItems]
    : enabledItems;

  return (
    <div className="configuration-section" id={id}>
      <div className="configuration-status-heading">
        <h3>
          {label}
          <span className="count">{visibleItems.length}</span>
        </h3>
        {disabledItems.length > 0 && (
          <button
            type="button"
            className="configuration-status-toggle"
            aria-expanded={showDisabled}
            aria-controls={`${id}-list`}
            onClick={() => setShowDisabled((visible) => !visible)}
          >
            {translate(showDisabled ? "Hide disabled" : "Show disabled")}
          </button>
        )}
      </div>
      <div className="configuration-status-list" id={`${id}-list`}>
        {visibleItems.length ? (
          visibleItems.map((item) => (
            <span
              className="type-chip configuration-status-chip"
              key={item.key}
              title={translate(item.enabled ? "Enabled" : "Disabled")}
            >
              <span
                className={classes(
                  "status configuration-status-dot",
                  item.enabled ? "enabled" : "disabled",
                )}
                aria-hidden="true"
              />
              {item.type && (
                <span className="configuration-status-type">{item.type}</span>
              )}
              <span className="configuration-status-name">{item.name}</span>
            </span>
          ))
        ) : (
          <span className="muted">{translate("None")}</span>
        )}
      </div>
    </div>
  );
};
