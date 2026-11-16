import translate from "@ff-client/utils/translations";
import { createElement, Fragment, type ReactNode, useId } from "react";

type Item = {
  key: string;
  heading?: string;
  content?: ReactNode;
};

type Props = {
  items: Item[];
  scope: string;
};

export const SidebarNavigation = ({ items, scope }: Props) => {
  const id = useId();
  // The native source group styles accompany Craft's disclosure control.
  const grouped = Boolean(window.customElements?.get("craft-disclosure"));
  const groups: { key: string; heading?: string; items: Item[] }[] = [];

  for (const item of items) {
    if (item.heading || !groups.length) {
      groups.push({ key: item.key, heading: item.heading, items: [] });
    }
    if (!item.heading) groups[groups.length - 1].items.push(item);
  }

  return (
    <nav>
      <ul className={grouped ? "sources-list" : undefined}>
        {groups.map((group) => {
          const links = group.items.map((item) => (
            <li key={item.key}>{item.content}</li>
          ));
          if (!group.heading)
            return <Fragment key={group.key}>{links}</Fragment>;

          if (!grouped) {
            return (
              <Fragment key={group.key}>
                <li className="heading">
                  <span>{group.heading}</span>
                </li>
                {links}
              </Fragment>
            );
          }

          const groupId = `freeform-sidebar-${id}-${group.key}`;

          return (
            <li className="heading" key={group.key}>
              <div className="source-item source-item--heading">
                <span className="type-heading-small">{group.heading}</span>
                {createElement(
                  "craft-disclosure",
                  {
                    persist: "",
                    "storage-key": `freeform-sidebar:${scope}:${group.heading}`,
                  },
                  <button
                    type="button"
                    className="source-item__toggle"
                    aria-controls={groupId}
                    aria-expanded="true"
                  >
                    <span className="cp-icon puny">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <path d="M201.4 374.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 306.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z" />
                      </svg>
                    </span>
                    <span className="visually-hidden">
                      {translate("Expand {heading} sources", {
                        heading: group.heading,
                      })}
                    </span>
                  </button>,
                )}
              </div>
              <ul id={groupId} className="sources-list">
                {links}
              </ul>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
