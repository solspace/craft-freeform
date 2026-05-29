import type { Recipient } from "@ff-client/types/notifications";
import classes from "@ff-client/utils/classes";
import type React from "react";

import { RecipientsController } from "../../../recipients/recipients.controller";

import { RecipientsWrapper } from "./recipients.styles";

type Props = {
  recipients: Recipient[];
  spanMultiple?: boolean;
  defaultValue?: string;
  onChange: (value: Recipient[]) => void;
};

export const Recipients: React.FC<Props> = ({
  recipients,
  spanMultiple,
  defaultValue,
  onChange,
}) => {
  const value =
    recipients.length === 0 && defaultValue
      ? [{ email: defaultValue }]
      : recipients;

  return (
    <RecipientsWrapper className={classes(spanMultiple && "multiple")}>
      <RecipientsController value={value} onChange={onChange} />
    </RecipientsWrapper>
  );
};
