import type { FormWithStats } from "@ff-client/types/forms";
import translate from "@ff-client/utils/translations";
import ArchiveIcon from "@ff-icons/actions/archive";
import type React from "react";
import { useId, useState } from "react";

import { ArchivedItem } from "./archived.item";
import { ArchivedItems, Button, Count, Wrapper } from "./archived.styles";

type Props = {
  data: FormWithStats[];
};

export const Archived: React.FC<Props> = ({ data }) => {
  const [isVisible, setIsVisible] = useState(false);
  const panelId = useId();
  if (!data?.length) {
    return null;
  }

  return (
    <Wrapper>
      <h2>
        <Button
          type="button"
          id={`${panelId}-heading`}
          aria-expanded={isVisible}
          aria-controls={panelId}
          aria-label={`${translate(isVisible ? "Hide archived forms" : "Show archived forms")} (${data.length})`}
          onClick={() => setIsVisible(!isVisible)}
        >
          <ArchiveIcon />
          <span>{translate("Archived Forms")}</span>
          <Count>{data.length}</Count>
          <svg
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            className="archive-chevron"
          >
            <path
              d="m6 4 4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
      </h2>
      {isVisible && (
        <ArchivedItems id={panelId} aria-labelledby={`${panelId}-heading`}>
          {data.map((form) => (
            <ArchivedItem key={form.id} form={form} />
          ))}
        </ArchivedItems>
      )}
    </Wrapper>
  );
};
