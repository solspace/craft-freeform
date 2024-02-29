import React from 'react';
import { Checkbox } from '@components/elements/checkbox/checkbox';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';

import type { Form, Submissions } from '../../import.types';
import {
  BlockItem,
  Blocks,
  Directory,
  File,
  Label,
  ListItem,
  Spacer,
} from '../preview.styles';

type Props = {
  submissions: Submissions[];
  forms: Form[];
  options: string[];
  onUpdate: (options: string[]) => void;
};

export const PreviewSubmissionsTemplates: React.FC<Props> = ({
  submissions,
  forms,
  options,
  onUpdate,
}) => {
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
                : onUpdate(submissions.map((submission) => submission.formUid))
            }
          />
        </BlockItem>
        <Directory />
        <Label htmlFor="submissions-all">{translate('Submissions')}</Label>
      </Blocks>

      <ul>
        {submissions.map((submission) => (
          <ListItem
            key={submission.formUid}
            className={classes(
              'selectable',
              options.includes(submission.formUid) && 'selected'
            )}
          >
            <Blocks>
              <BlockItem>
                <Checkbox
                  id={`submissions-${submission.formUid}`}
                  checked={options.includes(submission.formUid)}
                  onChange={() =>
                    onUpdate(
                      options.includes(submission.formUid)
                        ? options.filter((id) => id !== submission.formUid)
                        : [...options, submission.formUid]
                    )
                  }
                />
              </BlockItem>
              <Spacer $dash />
              <File />
              <Label $light htmlFor={`submissions-${submission.formUid}`}>
                {forms.find((form) => form.uid === submission.formUid).name}
                {` (${submission.count})`}
              </Label>
            </Blocks>
          </ListItem>
        ))}
      </ul>
    </ListItem>
  );
};
