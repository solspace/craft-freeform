import React, { useRef } from 'react';
import { RemoveButton } from '@components/elements/remove-button/remove';
import { useHover } from '@ff-client/hooks/use-hover';
import { useFieldType } from '@ff-client/queries/field-types';
import type { FieldFavorite } from '@ff-client/types/fields';
import classes from '@ff-client/utils/classes';
import { sanitize } from 'dompurify';

import { FieldListItem, Icon } from './modal.styles';

type Props = {
  favorite: FieldFavorite;
  label: string;
  errors?: string[];
  isActive?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
};

export const FavoriteListItem: React.FC<Props> = ({
  favorite,
  label,
  errors,
  isActive,
  onClick,
  onDelete,
}) => {
  const ref = useRef<HTMLLIElement>(null);
  const hovering = useHover(ref);
  const fieldType = useFieldType(favorite.typeClass);
  if (!fieldType) {
    return null;
  }

  const hasErrors = errors !== undefined && errors.length;

  return (
    <FieldListItem
      key={favorite.id}
      ref={ref}
      onClick={onClick}
      className={classes(isActive && 'active', hasErrors && 'errors')}
    >
      <Icon dangerouslySetInnerHTML={{ __html: sanitize(fieldType.icon) }} />
      <span dangerouslySetInnerHTML={{ __html: sanitize(label) }} />
      <RemoveButton active={hovering} onClick={onDelete} />
    </FieldListItem>
  );
};
