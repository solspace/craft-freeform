import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Search } from '@components/search/search';
import classes from '@ff-client/utils/classes';

import { useIntegrationNavigation } from './sidebar.queries';
import {
  Category,
  CategoryList,
  CategoryTitle,
  Icon,
  Integration,
  IntegrationList,
  IntegrationTitle,
  SearchWrapper,
  SidebarNavigation,
  StatusIndicator,
  Version,
} from './sidebar.styles';

export const Sidebar: React.FC = () => {
  const { pathname: currentUrl } = useLocation();
  const { data, isFetching } = useIntegrationNavigation();

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

  return (
    <SidebarNavigation>
      <SearchWrapper>
        <Search query={query} setQuery={setQuery} />
      </SearchWrapper>

      <CategoryList>
        {filteredData.map((category) => (
          <Category key={category.handle}>
            <CategoryTitle>{category.title}</CategoryTitle>
            <IntegrationList>
              {category.entries.map((entry) => {
                const key = entry.type.class;
                const type = entry.type;
                const title = entry.type.name;

                const isStatusActive = entry.instances.length > 0;

                const instances = entry.instances.length;
                const indicatorText = instances > 1 ? instances : '';

                let url = `${type.type}/${type.shortName}`;
                const isActive = currentUrl.includes(url);
                if (instances > 0) {
                  url += `/${entry.instances[0].id}`;
                }

                return (
                  <Integration key={key}>
                    <NavLink to={url} className={classes(isActive && 'active')}>
                      <StatusIndicator
                        className={classes(isStatusActive && 'active')}
                      >
                        {indicatorText}
                      </StatusIndicator>

                      {entry.type.iconSvg && (
                        <Icon
                          dangerouslySetInnerHTML={{
                            __html: entry.type.iconSvg,
                          }}
                        />
                      )}
                      {!entry.type.iconSvg && (
                        <Icon>
                          <i className="fa-solid fa-cog" />
                        </Icon>
                      )}

                      <IntegrationTitle>{title}</IntegrationTitle>
                      {type.version && <Version>{type.version}</Version>}
                    </NavLink>
                  </Integration>
                );
              })}
            </IntegrationList>
          </Category>
        ))}
      </CategoryList>
    </SidebarNavigation>
  );
};
