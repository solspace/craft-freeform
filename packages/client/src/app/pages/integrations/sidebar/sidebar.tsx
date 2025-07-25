import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  SidebarNavigation,
  StatusIndicator,
  Version,
} from './sidebar.styles';

export const Sidebar: React.FC = () => {
  const { pathname: currentUrl } = useLocation();
  const { data, isFetching } = useIntegrationNavigation();

  if (isFetching && !data) {
    return <SidebarNavigation />;
  }

  return (
    <SidebarNavigation>
      <CategoryList>
        {data.map((category) => (
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
