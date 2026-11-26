type BadgeCount = { count: number; formattedCount: string; label: string };

/** Keep Craft's native badge markup, including its screen-reader label. */
export function initializeActivityBadge(
  link: HTMLAnchorElement,
  load: () => Promise<BadgeCount>,
): () => void {
  let pending = false;
  let disposed = false;
  const refresh = async (): Promise<void> => {
    if (disposed || pending || document.hidden || !link.isConnected) return;
    pending = true;
    try {
      const result = await load();
      if (
        disposed ||
        !link.isConnected ||
        !Number.isSafeInteger(result.count) ||
        result.count < 0
      )
        return;
      let badge = link.querySelector<HTMLElement>(".badge");
      let label = link.querySelector<HTMLElement>("[data-notification]");
      if (!result.count) {
        badge?.closest(".sidebar-action__badge")?.remove();
        badge?.remove();
        label?.remove();
        return;
      }
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "badge";
        badge.setAttribute("aria-hidden", "true");
        label = document.createElement("span");
        label.className = "visually-hidden";
        label.dataset.notification = "";
        const suffix = link.querySelector(".sidebar-action__suffix");
        if (suffix) {
          const wrapper = document.createElement("span");
          wrapper.className = "sidebar-action__badge";
          wrapper.append(badge, label);
          suffix.append(wrapper);
        } else {
          link.append(badge, label);
        }
      }
      badge.textContent = result.formattedCount;
      if (label) label.textContent = result.label;
    } catch {
      // Keep the last known count on network errors or an expired session.
    } finally {
      pending = false;
    }
  };
  const timer = window.setInterval(refresh, 30_000);
  window.addEventListener("focus", refresh);
  window.addEventListener("online", refresh);
  document.addEventListener("visibilitychange", refresh);
  return () => {
    disposed = true;
    window.clearInterval(timer);
    window.removeEventListener("focus", refresh);
    window.removeEventListener("online", refresh);
    document.removeEventListener("visibilitychange", refresh);
  };
}

const craft = (
  window as typeof window & {
    Craft?: {
      getCpUrl(path: string): string;
      sendActionRequest(
        method: string,
        action: string,
        options: { timeout: number },
      ): Promise<{ data: BadgeCount }>;
    };
  }
).Craft;

if (craft) {
  const activityUrl = new URL(
    craft.getCpUrl("freeform/activity"),
    location.href,
  );
  const link = Array.from(
    document.querySelectorAll<HTMLAnchorElement>("#nav-freeform a[href]"),
  ).find((item) => new URL(item.href).pathname === activityUrl.pathname);
  if (link) {
    initializeActivityBadge(link, async () => {
      const response = await craft.sendActionRequest(
        "GET",
        "freeform/activity/badge",
        { timeout: 10_000 },
      );
      return response.data;
    });
  }
}
