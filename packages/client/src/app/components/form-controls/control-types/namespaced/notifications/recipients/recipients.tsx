import React, { useEffect } from 'react';
import { HelpText } from '@components/elements/help-text';
import { Control } from '@components/form-controls/control';
import { useCellNavigation } from '@components/form-controls/hooks/use-cell-navigation';
import type { ControlType } from '@components/form-controls/types';
import CrossIcon from '@ff-client/assets/icons/cross-icon.svg';
import { useOnKeypress } from '@ff-client/hooks/use-on-keypress';
import type { Recipient } from '@ff-client/types/notifications';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';

import MailIcon from './mail-icon.svg';
import {
  addRecipient,
  cleanupRecipients,
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

const Recipients: React.FC<ControlType<Recipient[]>> = ({
  value = [],
  property,
  errors,
  updateValue,
}) => {
  const { activeCell, setActiveCell, setCellRef } = useCellNavigation(
    value.length,
    1
  );

  const addCell = (): void => {
    setActiveCell(value.length, 0);
    updateValue(addRecipient(value));
  };

  useOnKeypress(
    {
      callback: (event: KeyboardEvent): void => {
        if (event.key === 'Enter') {
          addCell();
        }
      },
    },
    [value]
  );

  useEffect(() => {
    return () => {
      updateValue(cleanupRecipients(value));
    };
  }, []);

  return (
    <Control property={property} errors={errors}>
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
                onChange={(event) =>
                  updateValue(
                    updateRecipient(
                      index,
                      {
                        ...recipient,
                        email: event.target.value,
                      },
                      value
                    )
                  )
                }
              />

              <Button
                onClick={() => {
                  updateValue(removeRecipient(value, index));
                  setActiveCell(Math.max(index - 1, 0), 0);
                }}
              >
                <CrossIcon />
              </Button>
            </RecipientItem>
          ))}
      </RecipientWrapper>
      <HelpText>
        <span
          dangerouslySetInnerHTML={{
            __html: translate(
              'Press <b>enter</b> while focusing an input to add a new set of inputs.'
            ),
          }}
        />
      </HelpText>
    </Control>
  );
};

export default Recipients;
