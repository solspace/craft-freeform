import React from 'react';
import { Checkbox } from '@components/elements/checkbox/checkbox';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';

import type { Submissions } from '../../../import/import.types';
import {
  BlockItem,
  Blocks,
  Directory,
  Label,
  ListItem,
  Spacer,
  SubmissionIcon,
} from '../preview.styles';

type Props = {
  submissions: Submissions[];
  options: string[];
  onUpdate: (options: string[]) => void;
};

export const PreviewSubmissionsTemplates: React.FC<Props> = ({
  submissions,
  options,
  onUpdate,
}) => {
  if (!Array.isArray(submissions) || !submissions.length) {
    return null;
  }

  return (
    <ListItem>
      <Blocks>
        <BlockItem>
          <Checkbox
            id="submissions-all"
            checked={options.length === submissions.length}
            onChange={() =>
              options.length === submissions.length
                ? onUpdate([])
                : onUpdate(submissions.map((submission) => submission.form.uid))
            }
          />
        </BlockItem>
        <Directory />
        <Label htmlFor="submissions-all">{translate('Submissions')}</Label>
      </Blocks>

      <ul>
        {submissions.map((submission) => (
          <ListItem
            key={submission.form.uid}
            className={classes(
              'selectable',
              options.includes(submission.form.uid) && 'selected'
            )}
          >
            <Blocks>
              <BlockItem>
                <Checkbox
                  id={`submissions-${submission.form.uid}`}
                  checked={options.includes(submission.form.uid)}
                  onChange={() =>
                    onUpdate(
                      options.includes(submission.form.uid)
                        ? options.filter((id) => id !== submission.form.uid)
                        : [...options, submission.form.uid]
                    )
                  }
                />
              </BlockItem>
              <Spacer $dash />
              <SubmissionIcon />
              <Label $light htmlFor={`submissions-${submission.form.uid}`}>
                {submission.form.name} ({submission.count})
              </Label>
            </Blocks>
          </ListItem>
        ))}
      </ul>
    </ListItem>
  );
};
