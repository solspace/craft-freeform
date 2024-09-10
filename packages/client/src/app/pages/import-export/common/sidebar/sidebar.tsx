import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { SidebarContainer } from '@components/layout/blocks/sidebar-container';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';
import { generateUrl } from '@ff-client/utils/urls';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

type Link = {
  title: string;
  url: string;
};

type Heading = {
  heading: string;
};

type Response = Array<Link & Heading>;

const localLinks = ['forms', 'express-forms'];

export const Sidebar: React.FC = () => {
  const { pathname: currentUrl } = useLocation();
  const { data, isFetching } = useQuery<Response>(
    ['import-export', 'navigation'],
    {
      queryFn: () =>
        axios
          .get<Response>('/api/import-export/navigation')
          .then((res) => res.data),
    }
  );

  if (isFetching && !data) {
    return (
      <SidebarContainer>
        <nav />
      </SidebarContainer>
    );
  }

  return (
    <SidebarContainer>
      <nav>
        <ul>
          {data.map((item, i) => {
            if (item?.heading) {
              return (
                <li className="heading" key={i}>
                  <span>{translate(item.heading)}</span>
                </li>
              );
            }

            const url = item.url.replace(/^freeform/, '');
            const isLocal = localLinks.some((keyword) => url.includes(keyword));
            const label = translate(item.title);

            return (
              <li key={i}>
                {isLocal && (
                  <NavLink
                    to={url}
                    className={classes(url === currentUrl && 'sel')}
                  >
                    {label}
                  </NavLink>
                )}
                {!isLocal && <a href={generateUrl(url)}>{label}</a>}
              </li>
            );
          })}
        </ul>
      </nav>
    </SidebarContainer>
  );
};
