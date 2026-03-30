import type { Recipient } from "@ff-client/types/notifications";
import classes from "@ff-client/utils/classes";
import type React from "react";

import { RecipientsController } from "../../../recipients/recipients.controller";

import { RecipientsWrapper } from "./recipients.styles";

type Props = {
  recipients: Recipient[];
  spanMultiple?: boolean;
  onChange: (value: Recipient[]) => void;
};

export const Recipients: React.FC<Props> = ({
  recipients,
  spanMultiple,
  onChange,
}) => {
  return (
    <RecipientsWrapper className={classes(spanMultiple && "multiple")}>
      <RecipientsController value={recipients} onChange={onChange} />
    </RecipientsWrapper>
  );
};
