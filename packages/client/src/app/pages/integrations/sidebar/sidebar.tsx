import type { FC } from 'react';
import React, { useState } from 'react';
import { Search } from '@components/search/search';
import translate from '@ff-client/utils/translations';

import { useTitlebarFavorites } from '../titlebar-favorites';

import { EntryComponent } from './sidebar.entry';
import { useIntegrationNavigation } from './sidebar.queries';
import {
  Category,
  CategoryList,
  CategoryTitle,
  IntegrationList,
  SearchWrapper,
  SidebarNavigation,
} from './sidebar.styles';

export const Sidebar: FC = () => {
  const { data, isFetching } = useIntegrationNavigation();

  const { hasFavorite } = useTitlebarFavorites();

  const [query, setQuery] = useState('');

  if (isFetching && !data) {
    return <SidebarNavigation />;
  }

  const filteredData = data
    .map((category) => ({
      ...category,
      entries: category.entries.filter(
        (entry) =>
          entry.type.name.toLowerCase().includes(query.toLowerCase()) ||
          entry.instances.some((instance) =>
            instance.name.toLowerCase().includes(query.toLowerCase())
          )
      ),
    }))
    .filter((category) => category.entries.length > 0);

  const favorites = filteredData.flatMap((category) =>
    category.entries.filter((entry) => hasFavorite(entry.type))
  );

  const categorizedData = filteredData
    .map((category) => ({
      ...category,
      entries: category.entries.filter((entry) => !hasFavorite(entry.type)),
    }))
    .filter((category) => category.entries.length > 0);

  return (
    <SidebarNavigation>
      <SearchWrapper>
        <Search query={query} setQuery={setQuery} />
      </SearchWrapper>

      <CategoryList>
        {favorites.length > 0 && (
          <Category key="favorites">
            <CategoryTitle>{translate('Favorites')}</CategoryTitle>
            <IntegrationList>
              {favorites.map((entry) => (
                <EntryComponent key={entry.type.shortName} entry={entry} />
              ))}
            </IntegrationList>
          </Category>
        )}

        {categorizedData.map((category) => (
          <Category key={category.handle}>
            <CategoryTitle>{category.title}</CategoryTitle>
            <IntegrationList>
              {category.entries.map((entry) => (
                <EntryComponent key={entry.type.shortName} entry={entry} />
              ))}
            </IntegrationList>
          </Category>
        ))}
      </CategoryList>
    </SidebarNavigation>
  );
};
