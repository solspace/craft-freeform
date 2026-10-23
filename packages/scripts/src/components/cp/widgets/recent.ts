import { refreshWidget } from "@lib/cp/widgets/refresh-widget";
import { formatRelativeDate } from "@lib/cp/widgets/relative-date";
import { SearchableSelect } from "../../../../../frontend/core/src/select/searchable-select";

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
    if (!select || (select === forms && root.hasAttribute("data-form-filter")))
      continue;
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
  if (forms && state && !root.hasAttribute("data-form-filter"))
    forms.value = state.form;
  if (statuses && state) statuses.value = state.status;
  const serverFilter = root.hasAttribute("data-form-filter");
  const picker =
    forms && serverFilter
      ? new SearchableSelect(forms, {
          placeholder: forms.dataset.searchLabel || "Search forms",
          noResults: forms.dataset.noResults || "No results found.",
          toggleLabel: forms.dataset.toggleLabel || "Show options",
          resultsLabel:
            forms.dataset.resultsLabel || "{count} results available.",
        })
      : null;
  // A separate label keeps the closed control's ellipsis consistent across browsers.
  const selectedLabel = picker ? document.createElement("span") : null;
  if (selectedLabel && picker) {
    selectedLabel.className = "freeform-recent-form-label";
    selectedLabel.setAttribute("aria-hidden", "true");
    picker.input.after(selectedLabel);
  }
  const syncPicker = () => {
    picker?.sync();
    if (selectedLabel && forms) {
      selectedLabel.textContent = forms.selectedOptions[0]?.label || "";
    }
  };
  syncPicker();
  let request = 0;
  const refreshLabel = refresh?.textContent;
  async function reload(formId: string, focusPicker = false) {
    const current = ++request;
    const previousForm = root!.dataset.formFilter || "";
    if (refresh) {
      refresh.disabled = true;
      refresh.textContent = refresh.dataset.refreshingLabel || "Refreshing…";
    }
    if (forms) forms.disabled = true;
    syncPicker();
    root!.setAttribute("aria-busy", "true");
    if (feedback) feedback.hidden = true;
    try {
      const nextRoot = await refreshWidget(
        root!,
        (next) => {
          picker?.destroy();
          initRecent(next, {
            search: search?.value || "",
            form: formId,
            status: statuses?.value || "",
            oldestFirst,
            page: focusPicker ? 0 : page,
          });
        },
        {
          ...(serverFilter ? { formId } : {}),
          isCurrent: () => current === request,
        },
      );
      const updated = nextRoot.querySelector<HTMLElement>(
        "[data-widget-feedback]",
      );
      if (updated && !focusPicker) {
        updated.textContent =
          nextRoot.dataset.refreshedLabel || "Submissions refreshed.";
        updated.hidden = false;
      }
      nextRoot
        .querySelector<HTMLElement>(
          focusPicker ? "[data-recent-search]" : "[data-recent-refresh]",
        )
        ?.focus();
    } catch {
      if (current !== request) return;
      if (forms && serverFilter) forms.value = previousForm;
      if (feedback) {
        feedback.textContent =
          root!.dataset.refreshError ||
          "Could not refresh submissions. Please try again.";
        feedback.hidden = false;
        feedback.classList.add("error");
      }
    } finally {
      if (current === request) {
        if (refresh) {
          refresh.disabled = false;
          refresh.textContent = refreshLabel || "";
        }
        if (forms) forms.disabled = false;
        syncPicker();
        root!.removeAttribute("aria-busy");
      }
    }
  }
  refresh?.addEventListener("click", () => void reload(forms?.value || ""));
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
    const selectedForm = serverFilter ? root!.dataset.formFilter : forms?.value;
    const filtered = rows.filter(
      (row) =>
        (!selectedForm || row.dataset.formId === selectedForm) &&
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
    root!.querySelector("[data-recent-list]")?.append(...visible);
    if (empty) empty.hidden = filtered.length > 0;
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
  forms?.addEventListener("change", () => {
    if (serverFilter) void reload(forms.value, true);
    else filter();
  });
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
    const reloadAll = serverFilter && !!root.dataset.formFilter;
    if (forms) forms.value = "";
    syncPicker();
    if (statuses) statuses.value = "";
    if (reloadAll) void reload("", true);
    else filter();
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
  render();
}

window.FreeformRecent = initRecent;
