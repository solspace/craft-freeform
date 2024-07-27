import React from 'react';
import { Checkbox } from '@components/elements/checkbox/checkbox';
import { useQueryFormsWithStats } from '@ff-client/queries/forms';
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

  const { data: forms, isFetched } = useQueryFormsWithStats();

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
              <SubmissionIcon />
              <Label $light htmlFor={`submissions-${submission.formUid}`}>
                {isFetched &&
                  forms.find((form) => form.uid === submission.formUid)?.name}
                {` (${submission.count})`}
              </Label>
            </Blocks>
          </ListItem>
        ))}
      </ul>
    </ListItem>
  );
};
