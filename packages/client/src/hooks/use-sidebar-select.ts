import { useEffect } from "react";

const setSelected = (
  element: HTMLLIElement | undefined,
  selected: boolean,
): void => {
  if (!element) {
    return;
  }

  const child = element.children[0] as HTMLElement | undefined;
  if (!child) {
    return;
  }

  const sidebar = element.querySelector(".sidebar-action--sub");

  if (selected) {
    child.classList.add("sel");
    sidebar?.classList.add("sel");
    sidebar?.setAttribute("aria-current", "page");
  } else {
    child.classList.remove("sel");
    sidebar?.classList.remove("sel");
    sidebar?.removeAttribute("aria-current");
  }
};

export const useSidebarSelect = (urlPart: string): void => {
  useEffect(() => {
    const navItems = document.querySelectorAll<HTMLLIElement>(
      "#nav-freeform > ul > li",
    );

    navItems.forEach((item) => {
      const url = item.querySelector("a.sidebar-action")?.getAttribute("href");
      setSelected(item, url?.includes(urlPart) ?? false);
    });

    return () => {
      navItems.forEach((item) => {
        setSelected(item, false);
      });

      if (navItems.length > 0) {
        setSelected(navItems[0], true);
      }
    };
  }, [urlPart]);
};
