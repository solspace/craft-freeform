import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Search } from '@editor/store/slices/search';
import { searchSelectors } from '@editor/store/slices/search/search.selectors';
import type { FieldForm } from '@ff-client/types/fields';
import classes from '@ff-client/utils/classes';

import { List } from '../../field-group/field-group.styles';

import ChevronIcon from './chevron.svg';
import { FieldItem } from './field-item';
import { useFormBlockAnimations } from './form-block.animations';
import {
  ExpandedState,
  FieldListContainer,
  FormBlockWrapper,
  FormTitle,
} from './form-block.styles';

type Props = {
  form: FieldForm;
};

export const FormBlock: React.FC<Props> = ({ form }) => {
  const [expanded, setExpanded] = useState(false);
  const searchQuery = useSelector(searchSelectors.query(Search.Fields));

  const isOpen = expanded || searchQuery.length > 0;

  const animation = useFormBlockAnimations(isOpen);

  if (!form.fields.length) {
    return null;
  }

  return (
    <FormBlockWrapper className={classes(isOpen && 'open')}>
      <FormTitle onClick={() => setExpanded(!expanded)}>
        {form.name}

        <ExpandedState>
          <ChevronIcon />
        </ExpandedState>
      </FormTitle>
      <FieldListContainer style={animation}>
        <List>
          {form.fields.map((field) => (
            <FieldItem key={field.uid} field={field} />
          ))}
        </List>
      </FieldListContainer>
    </FormBlockWrapper>
  );
};
