import type { GenericValue } from "@ff-client/types/properties";
import classes from "@ff-client/utils/classes";
import translate from "@ff-client/utils/translations";
import type { FC } from "react";
import { useCallback } from "react";
import Skeleton from "react-loading-skeleton";
import styled from "styled-components";
import { useEntryQuery } from "./craft-entry-picker.queries";

type Props = {
  actionLabel?: string;
  multiSelect?: boolean;
  sources?: string[] | string;
  criteria?: Record<string, GenericValue>;
  limit?: number;
  value: number[];
  onUpdate: (value: number[]) => void;
};

export const CraftEntryPicker: FC<Props> = ({
  actionLabel,
  multiSelect,
  sources = "*",
  criteria,
  limit,
  value,
  onUpdate,
}) => {
  const { data, isFetching } = useEntryQuery(value);

  const openModal = useCallback((): void => {
    Craft.createElementSelectorModal("craft\\elements\\Entry", {
      multiSelect: limit !== 1 || multiSelect,
      sources,
      criteria,
      storageKey: "freeform-entry-selection",
      onSelect: (elements) => {
        // Format selected entries
        const selectedIds = elements
          .map((element) => element.id)
          .slice(0, limit);

        const newIds = selectedIds.filter((id) => !value?.includes(id));
        const combinedIds = [...(value || []), ...newIds];

        onUpdate(combinedIds);
      },
    });
  }, [onUpdate, multiSelect, criteria, limit, sources, value]);

  const removeEntry = useCallback(
    (entryId: number): void => {
      onUpdate(value.filter((id: number) => id !== entryId));
    },
    [onUpdate, value],
  );

  const showAddButton =
    limit === undefined || value?.length === undefined || value?.length < limit;
  const showLoading = data === undefined && isFetching && value?.length > 0;

  return (
    <div className="elementselect">
      <ul className="elements chips chips-small">
        {showLoading &&
          value.map((id, idx) => (
            <li key={`skeleton-${id}`} className="element small">
              <div className="chip small element">
                <div className="thumb">
                  <Skeleton width={30} height={20} />
                </div>

                <div className="chip-content">
                  <Skeleton width={getSkeletonWidth(idx)} />
                </div>
              </div>
            </li>
          ))}

        {data?.map((entry) => (
          <li key={entry.id} className="element small removable">
            <div className="chip small element removable">
              <div className="chip-content">
                <span
                  className={classes(
                    "status",
                    entry.status === "live" ? "open teal" : "disabled",
                  )}
                  role="img"
                  aria-label={translate("Status: {status}", {
                    status: entry.status,
                  })}
                />
                <div className="element-label">
                  <a
                    className="label-link"
                    href={entry.editUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {entry.title}
                  </a>
                </div>

                <div className="chip-actions">
                  <Button
                    type="button"
                    title={translate("Remove")}
                    onClick={() => removeEntry(entry.id)}
                  />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {showAddButton && (
        <div className="flex">
          <button type="button" className="btn add icon" onClick={openModal}>
            {translate(actionLabel || "Add an entry")}
          </button>
        </div>
      )}
    </div>
  );
};

const widthMap = [80, 100, 90, 70, 120];

const getSkeletonWidth = (index: number): number => {
  return widthMap[index] || 100;
};

const Button = styled.button`
  font-family: 'Craft';
  font-size: 14px;

  &:before {
    content: 'remove';
  }
`;
