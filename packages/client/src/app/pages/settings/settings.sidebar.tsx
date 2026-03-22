import { generateUrl } from "@ff-client/utils/urls";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import DOMPurify from "dompurify";
import type React from "react";
import Skeleton from "react-loading-skeleton";
import { Link } from "react-router-dom";

type Item = {
  title?: string;
  heading?: string;
};

type Props = {
  activeKey: string;
};

const REACT_SETTINGS_KEYS = new Set(["limited-users", "ai"]);

export const SettingsSidebar: React.FC<Props> = ({ activeKey }) => {
  const { data, isFetching } = useQuery({
    queryKey: ["settings", "navigation"],
    queryFn: () => {
      return axios.get("/api/settings/navigation").then((res) => res.data);
    },
  });

  if (!data && isFetching) {
    return (
      <div id="sidebar-container">
        <div id="sidebar" className="sidebar">
          <nav>
            <ul>
              {Array.from({ length: 10 }).map((_, idx) => (
                <li key={idx}>
                  <Skeleton width={140} height={10} />
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    );
  }

  return (
    <div id="sidebar-container">
      <div id="sidebar" className="sidebar">
        <nav>
          <ul>
            {Object.entries<Item>(data).map(([key, item]) => {
              if (item.title) {
                const isActive = key === activeKey;
                const isReactRoute = REACT_SETTINGS_KEYS.has(key);

                return (
                  <li key={key}>
                    {isReactRoute ? (
                      <Link
                        className={isActive ? "sel" : undefined}
                        to={`/settings/${key}`}
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(item.title),
                        }}
                      />
                    ) : (
                      <a
                        className={isActive ? "sel" : undefined}
                        href={generateUrl(`settings/${key}`)}
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(item.title),
                        }}
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

              return null;
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
};
