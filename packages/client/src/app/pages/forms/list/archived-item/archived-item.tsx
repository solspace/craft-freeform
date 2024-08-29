import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { QKForms } from '@ff-client/queries/forms';
import type { FormWithStats } from '@ff-client/types/forms';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';
import { useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';

import { useArchiveFormMutation } from '../list.mutations';

import {
  Item,
  ItemDate,
  ItemMeta,
  ItemTitle,
  ItemTitleLink,
} from './archived-item.styles';

type Props = {
  form: FormWithStats;
};

export const ArchivedItem: React.FC<Props> = ({ form }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { id, name, links, dateArchived } = form;

  const archiveMutation = useArchiveFormMutation();
  const isDisabled =
    archiveMutation.isLoading && archiveMutation.context === id;
  const isSuccess = archiveMutation.isSuccess && archiveMutation.context === id;

  const onNavigate = (): void => {
    queryClient.invalidateQueries(QKForms.single(Number(id)));
    navigate(`${id}`);
  };

  const hasTitleLink = links.filter(({ type }) => type === 'title').length;
  const linkList = form.links.filter(({ type }) => type === 'linkList');

  const getFormattedDate = (date: string): string =>
    format(parseISO(date), 'yyyy-MM-dd');

  return (
    <Item
      className={classes(isDisabled && 'disabled', isSuccess && 'restored')}
    >
      {hasTitleLink ? (
        <ItemTitleLink onClick={onNavigate}>{name}</ItemTitleLink>
      ) : (
        <ItemTitle>{name}</ItemTitle>
      )}
      {dateArchived && (
        <ItemDate>
          ({translate('archived')} {getFormattedDate(dateArchived)})
        </ItemDate>
      )}
      {linkList.length > 0 &&
        linkList
          .filter(({ count }) => count)
          .map((link, idx) =>
            link.internal ? (
              <ItemMeta key={idx}>
                <NavLink to={link.url}>{link.label}</NavLink>
              </ItemMeta>
            ) : (
              <ItemMeta key={idx}>
                <a href={link.url}>{link.label}</a>
              </ItemMeta>
            )
          )}
      <ItemMeta>
        <button
          onClick={() => {
            archiveMutation.mutate(id);
          }}
        >
          {translate('Restore this Form')}
        </button>
      </ItemMeta>
    </Item>
  );
};
