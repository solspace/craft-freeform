import { SidebarContainer } from "@components/layout/blocks/sidebar-container";
import translate from "@ff-client/utils/translations";
import { generateUrl } from "@ff-client/utils/urls";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { createElement, type FC, type MouseEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type Link = {
  title: string;
  url: string;
};

type Heading = {
  heading: string;
};

type Response = Array<Link & Heading>;

const localLinks = ["forms", "express-forms", "formie"];

export const Sidebar: FC = () => {
  const { pathname: currentUrl } = useLocation();
  const navigate = useNavigate();
  const { data, isFetching } = useQuery<Response>({
    queryKey: ["import-export", "navigation"],
    queryFn: () =>
      axios
        .get<Response>("/api/import-export/navigation")
        .then((res) => res.data),
  });

  if (isFetching && !data) {
    return (
      <SidebarContainer>
        <nav />
      </SidebarContainer>
    );
  }

  return (
    <SidebarContainer>
      <nav
        className="freeform-secondary-nav"
        aria-label={translate("Import / Export")}
      >
        {createElement(
          "craft-nav-list",
          null,
          (data ?? []).map((item, i) => {
            if (item.heading)
              return createElement(
                "craft-nav-item",
                { key: i, group: true },
                translate(item.heading),
              );
            const url = item.url.replace(/^freeform/, "");
            const isLocal = localLinks.some((keyword) => url.includes(keyword));
            const selected = url === currentUrl;
            return createElement(
              "craft-nav-item",
              {
                key: i,
                href: generateUrl(url),
                active: selected || undefined,
                current: selected || undefined,
                "aria-current": selected ? "page" : undefined,
                onClick: (event: MouseEvent<HTMLElement>) => {
                  if (
                    !isLocal ||
                    event.defaultPrevented ||
                    event.button !== 0 ||
                    event.metaKey ||
                    event.ctrlKey ||
                    event.shiftKey ||
                    event.altKey
                  )
                    return;
                  event.preventDefault();
                  navigate(url);
                },
              },
              translate(item.title),
            );
          }),
        )}
      </nav>
    </SidebarContainer>
  );
};
