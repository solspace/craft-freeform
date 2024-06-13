import React from 'react';
import { Link } from 'react-router-dom';
import { generateUrl } from '@ff-client/utils/urls';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

type Item = {
  title?: string;
  heading?: string;
};

export const SettingsSidebar: React.FC = () => {
  const { data, isFetching } = useQuery({
    queryKey: ['settings', 'navigation'],
    queryFn: () => {
      return axios.get('/api/settings/navigation').then((res) => res.data);
    },
  });

  if (!data && isFetching) {
    return null;
  }

  return (
    <div id="sidebar-container">
      <div id="sidebar" className="sidebar">
        <nav>
          <ul>
            {Object.entries<Item>(data).map(([key, item]) => {
              if (item.title) {
                return (
                  <li key={key}>
                    {key === 'limited-users' && (
                      <Link className="sel" to="/settings/limited-users">
                        {item.title}
                      </Link>
                    )}
                    {key !== 'limited-users' && (
                      <a
                        href={generateUrl(`settings/${key}`)}
                        dangerouslySetInnerHTML={{ __html: item.title }}
                      />
                    )}
                  </li>
                );
              }

              if (item.heading) {
                return (
                  <li key={key} className="heading">
                    <span>{item.heading}</span>
                  </li>
                );
              }
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
};
