import { useEffect } from 'react';

const setSelected = (element: HTMLLIElement, selected: boolean): void => {
  const child = <HTMLDivElement>element.children[0];
  const sidebar = element.querySelector('.sidebar-action--sub');

  if (selected) {
    child.classList.add('sel');
    sidebar?.classList.add('sel');
    sidebar?.setAttribute('aria-current', 'page');
  } else {
    child.classList.remove('sel');
    sidebar?.classList.remove('sel');
    sidebar?.removeAttribute('aria-current');
  }
};

export const useSidebarSelect = (urlPart: string): void => {
  const navItems = document.querySelectorAll<HTMLLIElement>(
    '#nav-freeform > ul > li'
  );

  useEffect(() => {
    navItems.forEach((item) => {
      const url = item.querySelector('a.sidebar-action')?.getAttribute('href');
      setSelected(item, url?.includes(urlPart));
    });

    return () => {
      navItems.forEach((item) => {
        setSelected(item, false);
      });

      setSelected(navItems[0], true);
    };
  }, [urlPart]);
};
