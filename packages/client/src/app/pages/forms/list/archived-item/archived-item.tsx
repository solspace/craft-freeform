import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import type { FormWithStats } from '@ff-client/queries/forms';
import { QKForms } from '@ff-client/queries/forms';
import { useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';

import {
  Item,
  ItemDate,
  ItemLink,
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

  const onNavigate = (): void => {
    queryClient.invalidateQueries(QKForms.single(Number(id)));
    navigate(`${id}`);
  };

  const hasTitleLink = links.filter(({ type }) => type === 'title').length;
  const linkList = form.links.filter(({ type }) => type === 'linkList');

  const getFormattedDate = (date: string): string =>
    format(parseISO(date), 'yyyy-MM-dd');

  return (
    <Item>
      {hasTitleLink ? (
        <ItemTitleLink onClick={onNavigate}>{name}</ItemTitleLink>
      ) : (
        <ItemTitle>{name}</ItemTitle>
      )}
      {dateArchived && (
        <ItemDate>(archived {getFormattedDate(dateArchived)})</ItemDate>
      )}
      {linkList.length > 0 &&
        linkList
          .filter(({ count }) => count)
          .map((link, idx) =>
            link.internal ? (
              <ItemLink key={idx}>
                <NavLink to={link.url}>{link.label}</NavLink>
              </ItemLink>
            ) : (
              <ItemLink key={idx}>
                <a href={link.url}>{link.label}</a>
              </ItemLink>
            )
          )}
    </Item>
  );
};
