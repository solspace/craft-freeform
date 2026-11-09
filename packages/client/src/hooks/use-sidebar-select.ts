import { useEffect } from "react";

const setSelected = (element: HTMLLIElement, selected: boolean): void => {
  const child = element.firstElementChild;
  // Craft 4 renders a direct anchor; Craft 5 wraps its anchor in .nav-item.
  const sidebar = element.querySelector("a");

  if (selected) {
    child?.classList.add("sel");
    sidebar?.classList.add("sel");
    sidebar?.setAttribute("aria-current", "page");
  } else {
    child?.classList.remove("sel");
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
      const url = item.querySelector("a")?.getAttribute("href");
      setSelected(item, url?.includes(urlPart) ?? false);
    });

    return () => {
      navItems.forEach((item) => {
        setSelected(item, false);
      });

      if (navItems[0]) {
        setSelected(navItems[0], true);
      }
    };
  }, [urlPart]);
};
