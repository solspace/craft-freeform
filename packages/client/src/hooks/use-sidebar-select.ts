import { useEffect } from 'react';

const setSelected = (element: HTMLLIElement, selected: boolean): void => {
  const child = <HTMLDivElement>element.children[0];

  if (selected) {
    child.classList.add('sel');
  } else {
    child.classList.remove('sel');
  }
};

export const useSidebarSelect = (index: number): void => {
  const navItems = document.querySelectorAll<HTMLLIElement>(
    '#nav-freeform > ul > li'
  );

  useEffect(() => {
    navItems.forEach((item, i) => {
      setSelected(item, i === index);
    });

    return () => {
      navItems.forEach((item) => {
        setSelected(item, false);
      });

      setSelected(navItems[0], true);
    };
  }, [index]);
};
