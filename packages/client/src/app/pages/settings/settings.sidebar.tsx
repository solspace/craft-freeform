import translate from "@ff-client/utils/translations";
import { generateUrl } from "@ff-client/utils/urls";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import DOMPurify from "dompurify";
import { createElement, type FC, type MouseEvent } from "react";
import Skeleton from "react-loading-skeleton";
import { useNavigate } from "react-router-dom";

type Item = { title?: string; heading?: string };
type Props = { activeKey: string };
const REACT_SETTINGS_KEYS = new Set(["limited-users", "ai"]);

export const SettingsSidebar: FC<Props> = ({ activeKey }) => {
  const navigate = useNavigate();
  const { data, isFetching } = useQuery({
    queryKey: ["settings", "navigation"],
    queryFn: () =>
      axios
        .get("api/settings/navigation")
        .then((res) => res.data as Record<string, Item>),
  });

  return (
    <div id="sidebar-container">
      <div id="sidebar" className="sidebar">
        <nav
          className="freeform-secondary-nav"
          aria-label={translate("Settings")}
        >
          {!data && isFetching ? (
            <div aria-busy="true">
              {Array.from({ length: 10 }).map((_, idx) => (
                <div key={idx}>
                  <Skeleton width={140} height={20} />
                </div>
              ))}
            </div>
          ) : (
            createElement(
              "craft-nav-list",
              null,
              Object.entries(data ?? {}).map(([key, item]) => {
                if (item.heading)
                  return createElement(
                    "craft-nav-item",
                    { key, group: true },
                    item.heading,
                  );
                if (!item.title) return null;
                const selected = key === activeKey;
                return createElement("craft-nav-item", {
                  key,
                  href: generateUrl(`settings/${key}`),
                  active: selected || undefined,
                  current: selected || undefined,
                  "aria-current": selected ? "page" : undefined,
                  onClick: (event: MouseEvent<HTMLElement>) => {
                    if (
                      !REACT_SETTINGS_KEYS.has(key) ||
                      event.defaultPrevented ||
                      event.button !== 0 ||
                      event.metaKey ||
                      event.ctrlKey ||
                      event.shiftKey ||
                      event.altKey
                    )
                      return;
                    event.preventDefault();
                    navigate(`/settings/${key}`);
                  },
                  dangerouslySetInnerHTML: {
                    __html: DOMPurify.sanitize(item.title),
                  },
                });
              }),
            )
          )}
        </nav>
      </div>
    </div>
  );
};
