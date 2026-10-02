export function findFreeformNavLink(path: string): HTMLElement | null {
  const links = document.querySelectorAll<HTMLElement>(
    ".global-sidebar__nav craft-nav-item[href], ul.nav-item__subnav a[href], ul.subnav a[href]",
  );
  return (
    Array.from(links).find((link) => {
      const href = new URL(link.getAttribute("href"), document.baseURI);
      return (
        href.origin === location.origin &&
        href.pathname.replace(/\/$/, "").endsWith(path)
      );
    }) ?? null
  );
}

export function isPlainNavigation(event: MouseEvent): boolean {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

export function withCurrentSite(path: string, search: string): string {
  const site = new URLSearchParams(search).get("site");
  return site === null ? path : `${path}?${new URLSearchParams({ site })}`;
}

export function selectFreeformNavLink(path: string): void {
  const parent = document.querySelector("#nav-freeform-link");
  if (!parent) return;
  for (const row of parent.querySelectorAll<HTMLElement>(
    "craft-nav-item[href]",
  )) {
    const href = new URL(row.getAttribute("href"), document.baseURI);
    const section = href.pathname.split("/freeform/")[1]?.split("/")[0];
    const selected =
      !!section && (path === `/${section}` || path.startsWith(`/${section}/`));
    row.toggleAttribute("active", selected);
    row.toggleAttribute("current", selected);
  }
}
