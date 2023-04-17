import React from 'react';
import { useCellNavigation } from '@components/form-controls/hooks/use-cell-navigation';
import CrossIcon from '@ff-client/assets/icons/cross-icon.svg';
import type { Recipient } from '@ff-client/types/notifications';
import classes from '@ff-client/utils/classes';

import MailIcon from './mail-icon.svg';
import {
  addRecipient,
  removeRecipient,
  updateRecipient,
} from './recipients.operations';
import {
  Button,
  EmailInput,
  Icon,
  RecipientItem,
  RecipientWrapper,
} from './recipients.styles';

type Props = {
  value: Recipient[];
  onChange: (value: Recipient[]) => void;
};

const RecipientsController: React.FC<Props> = React.memo(
  ({ value, onChange }) => {
    const { activeCell, setActiveCell, setCellRef, keyPressHandler } =
      useCellNavigation(value.length, 1);

    const addCell = (): void => {
      setActiveCell(value.length, 0);
      onChange(addRecipient(value));
    };

    return (
      <RecipientWrapper>
        {!value.length && (
          <RecipientItem>
            <Icon>
              <MailIcon />
            </Icon>
            <EmailInput
              type="text"
              className={classes('text', 'fullwidth', 'code')}
              placeholder="john.doe@example.com"
              onClick={() => addCell()}
            />
          </RecipientItem>
        )}
        {value &&
          value.map((recipient, index) => (
            <RecipientItem key={index}>
              <Icon>
                <MailIcon />
              </Icon>
              <EmailInput
                type="text"
                className={classes('text', 'fullwidth', 'code')}
                autoFocus={activeCell === `${index}:0`}
                ref={(element) => setCellRef(element, index, 0)}
                onFocus={() => setActiveCell(index, 0)}
                placeholder="john.doe@example.com"
                value={recipient.email}
                onKeyDown={keyPressHandler({
                  onEnter: ({ shiftKey }) => {
                    const next = shiftKey ? index + 1 : value.length;
                    setActiveCell(next, 0);
                    onChange(addRecipient(value, shiftKey ? index : undefined));
                  },
                  onDelete: () => {
                    onChange(removeRecipient(value, index));
                    setActiveCell(index - 1, 0);
                  },
                })}
                onChange={(event) =>
                  onChange(
                    updateRecipient(
                      index,
                      { ...recipient, email: event.target.value },
                      value
                    )
                  )
                }
              />

              <Button
                tabIndex={-1}
                onClick={() => {
                  onChange(removeRecipient(value, index));
                  setActiveCell(Math.max(index - 1, 0), 0);
                }}
              >
                <CrossIcon />
              </Button>
            </RecipientItem>
          ))}
      </RecipientWrapper>
    );
  }
);

RecipientsController.displayName = 'RecipientsController';

export { RecipientsController };
