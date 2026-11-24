import type { FormWithStats } from "@ff-client/types/forms";
import translate from "@ff-client/utils/translations";
import ArchiveIcon from "@ff-icons/actions/archive";
import type React from "react";
import { useState } from "react";

import { FormListDisclosure } from "../../form-list-disclosure";
import { ArchivedItem } from "./archived.item";
import { ArchivedItems } from "./archived.styles";

type Props = {
  data: FormWithStats[];
};

export const Archived: React.FC<Props> = ({ data }) => {
  const [isVisible, setIsVisible] = useState(false);
  if (!data?.length) {
    return null;
  }

  return (
    <FormListDisclosure
      title={translate("Archived Forms")}
      label={translate(
        isVisible ? "Hide archived forms" : "Show archived forms",
      )}
      icon={<ArchiveIcon />}
      count={data.length}
      expanded={isVisible}
      onToggle={() => setIsVisible(!isVisible)}
    >
      <ArchivedItems>
        {data.map((form) => (
          <ArchivedItem key={form.id} form={form} />
        ))}
      </ArchivedItems>
    </FormListDisclosure>
  );
};
