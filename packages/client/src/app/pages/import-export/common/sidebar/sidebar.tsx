import React from 'react';
import { useLocation } from 'react-router-dom';
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

            return (
              <li key={i}>
                <a
                  href={generateUrl(url)}
                  className={classes(url === currentUrl && 'sel')}
                >
                  {translate(item.title)}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </SidebarContainer>
  );
};
