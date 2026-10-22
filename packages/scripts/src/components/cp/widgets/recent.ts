import { refreshWidget } from "@lib/cp/widgets/refresh-widget";
import { formatRelativeDate } from "@lib/cp/widgets/relative-date";

type RecentState = {
  search: string;
  form: string;
  status: string;
  oldestFirst: boolean;
  page: number;
};

declare global {
  interface Window {
    FreeformRecent: typeof initRecent;
  }
}

export function initRecent(root: HTMLElement | null, state?: RecentState) {
  if (!root || root.dataset.initialized) return;
  root.dataset.initialized = "true";
  const rows = Array.from(
    root.querySelectorAll<HTMLElement>("[data-recent-row]"),
  );
  const refresh = root.querySelector<HTMLButtonElement>(
    "[data-recent-refresh]",
  );
  const feedback = root.querySelector<HTMLElement>("[data-widget-feedback]");
  refresh?.addEventListener("click", async () => {
    const label = refresh.textContent;
    refresh.disabled = true;
    refresh.textContent = refresh.dataset.refreshingLabel || "Refreshing…";
    root.setAttribute("aria-busy", "true");
    if (feedback) feedback.hidden = true;
    try {
      const next = await refreshWidget(root, (next) =>
        initRecent(next, {
          search: search?.value || "",
          form: forms?.value || "",
          status: statuses?.value || "",
          oldestFirst,
          page,
        }),
      );
      const updated = next.querySelector<HTMLElement>("[data-widget-feedback]");
      if (updated) {
        updated.textContent =
          next.dataset.refreshedLabel || "Submissions refreshed.";
        updated.hidden = false;
      }
      next.querySelector<HTMLElement>("[data-recent-refresh]")?.focus();
    } catch {
      if (feedback) {
        feedback.textContent =
          root.dataset.refreshError ||
          "Could not refresh submissions. Please try again.";
        feedback.hidden = false;
        feedback.classList.add("error");
      }
    } finally {
      refresh.disabled = false;
      refresh.textContent = label;
      root.removeAttribute("aria-busy");
    }
  });
  const pageSize = Math.max(1, Number(root.dataset.pageSize) || 5);
  const search = root.querySelector<HTMLInputElement>("[data-recent-search]");
  const forms = root.querySelector<HTMLSelectElement>("[data-recent-form]");
  const statuses = root.querySelector<HTMLSelectElement>(
    "[data-recent-status]",
  );
  const sort = root.querySelector<HTMLButtonElement>("[data-recent-sort]");
  const previous = root.querySelector<HTMLButtonElement>(
    "[data-recent-previous]",
  );
  const next = root.querySelector<HTMLButtonElement>("[data-recent-next]");
  const pagingButtons = root.querySelector<HTMLElement>(
    "[data-recent-paging-buttons]",
  );
  const summary = root.querySelector<HTMLElement>("[data-recent-summary]");
  const empty = root.querySelector<HTMLElement>("[data-recent-empty]");
  let page = state?.page || 0;
  let oldestFirst = state?.oldestFirst || false;

  for (const [select, key, labelKey] of [
    [forms, "formId", "formName"],
    [statuses, "statusId", "statusName"],
  ] as const) {
    if (!select) continue;
    const options = new Map(
      rows.map((row) => [row.dataset[key]!, row.dataset[labelKey]!]),
    );
    for (const [value, label] of [...options].sort((a, b) =>
      a[1].localeCompare(b[1]),
    )) {
      select.add(new Option(label, value));
    }
  }

  if (search && state) search.value = state.search;
  if (forms && state) forms.value = state.form;
  if (statuses && state) statuses.value = state.status;
  const setSortLabel = () => {
    if (!sort) return;
    sort.setAttribute("aria-pressed", String(oldestFirst));
    sort.setAttribute(
      "aria-label",
      (oldestFirst ? root.dataset.newestLabel : root.dataset.oldestLabel) || "",
    );
    sort.title = sort.getAttribute("aria-label")!;
  };
  setSortLabel();

  function render() {
    const query = search?.value.trim().toLocaleLowerCase() || "";
    const filtered = rows.filter(
      (row) =>
        (!forms?.value || row.dataset.formId === forms.value) &&
        (!statuses?.value || row.dataset.statusId === statuses.value) &&
        (!query || row.textContent!.toLocaleLowerCase().includes(query)),
    );
    const ordered = oldestFirst ? [...filtered].reverse() : filtered;
    page = Math.min(
      page,
      Math.max(0, Math.ceil(ordered.length / pageSize) - 1),
    );
    const visible = ordered.slice(page * pageSize, (page + 1) * pageSize);
    const selected = new Set(visible);
    for (const row of rows) row.hidden = !selected.has(row);
    // Only visible nodes need to move; the backing data stays in date order.
    root!.querySelector("[data-recent-list]")!.append(...visible);
    if (empty) empty.hidden = !rows.length || filtered.length > 0;
    if (previous) previous.disabled = page === 0;
    if (next) next.disabled = (page + 1) * pageSize >= filtered.length;
    if (pagingButtons) pagingButtons.hidden = filtered.length <= pageSize;
    if (summary)
      summary.textContent = (
        root!.dataset.summaryLabel || "{start}–{end} of {total}"
      )
        .replace("{start}", String(filtered.length ? page * pageSize + 1 : 0))
        .replace(
          "{end}",
          String(Math.min((page + 1) * pageSize, filtered.length)),
        )
        .replace("{total}", filtered.length.toLocaleString());
  }

  const filter = () => {
    page = 0;
    render();
  };
  search?.addEventListener("input", filter);
  forms?.addEventListener("change", filter);
  statuses?.addEventListener("change", filter);
  sort?.addEventListener("click", () => {
    oldestFirst = !oldestFirst;
    setSortLabel();
    filter();
  });
  previous?.addEventListener("click", () => {
    if (page > 0) {
      page--;
      render();
    }
  });
  next?.addEventListener("click", () => {
    if (next && !next.disabled) {
      page++;
      render();
    }
  });
  root.querySelector("[data-recent-clear]")?.addEventListener("click", () => {
    if (search) search.value = "";
    if (forms) forms.value = "";
    if (statuses) statuses.value = "";
    filter();
    search?.focus();
  });
  for (const control of root.querySelectorAll<HTMLElement>(
    "[data-recent-tools], [data-recent-pagination]",
  ))
    control.hidden = false;
  const times = root.querySelectorAll<HTMLTimeElement>("time[datetime]");
  const updateDates = () => {
    for (const time of times) {
      const label = formatRelativeDate(
        time.dateTime,
        root.dataset.locale || document.documentElement.lang || "en",
        root.dataset.timeZone || "UTC",
      );
      if (label) time.textContent = label;
    }
  };
  updateDates();
  if (times.length) {
    const timer = window.setInterval(() => {
      if (!root.isConnected) window.clearInterval(timer);
      else updateDates();
    }, 60000);
  }
  if (rows.length) render();
}

window.FreeformRecent = initRecent;
