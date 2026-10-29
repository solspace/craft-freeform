type SearchableSelect = HTMLSelectElement & {
  selectize?: {
    setValue(value: string, silent?: boolean): void;
    $dropdown?: JQuery;
  };
};

type FilterWindow = Window & { jQuery?: JQueryStatic };

/** Keep the filter controls mounted while replacing only the server-rendered results. */
export function initializeActivityFilters(
  root: HTMLElement,
  bindResults: (results: HTMLElement) => void,
): () => void {
  const form = root.querySelector<HTMLFormElement>(".ff-activity-filters");
  let results = root.querySelector<HTMLElement>("[data-activity-results]");
  if (!form || !results) return () => {};

  const search = form.querySelector<HTMLInputElement>('input[name="q"]');
  const status = root.querySelector<HTMLElement>(
    "[data-activity-filter-status]",
  );
  const apply = form.querySelector<HTMLButtonElement>("[data-activity-apply]");
  const reset = form.querySelector<HTMLAnchorElement>("[data-activity-reset]");
  const spinner = root.querySelector<HTMLElement>("[data-activity-loading]");
  const $ = (window as FilterWindow).jQuery;
  const viewForm = root.querySelector<HTMLFormElement>(
    ".ff-activity-view-form",
  );
  let timer: ReturnType<typeof setTimeout> | undefined;
  let request: AbortController | undefined;
  let generation = 0;

  const urlForForm = (): URL => {
    const url = new URL(form.action, window.location.href);
    new FormData(form).forEach((value, name) => {
      if (
        typeof value === "string" &&
        value !== "" &&
        !(["category", "level"].includes(name) && value === "all")
      )
        url.searchParams.set(name, value);
    });
    return url;
  };
  let displayedFilters = urlForForm().href;

  const busy = (loading: boolean): void => {
    results?.setAttribute("aria-busy", String(loading));
    spinner?.classList.toggle("hidden", !loading);
  };
  const message = (key: "loading" | "error" | "complete"): void => {
    if (!status) return;
    status.textContent = status.dataset[key] || "";
    status.classList.toggle("visually-hidden", key !== "error");
    status.classList.toggle("error", key === "error");
  };
  const syncViewForm = (): void => {
    const viewForm = root.querySelector<HTMLFormElement>(
      ".ff-activity-view-form",
    );
    if (!viewForm) return;
    viewForm
      .querySelectorAll("[data-activity-view-filter]")
      .forEach((input) => {
        input.remove();
      });
    new FormData(form).forEach((value, name) => {
      if (name === "view" || typeof value !== "string") return;
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      input.dataset.activityViewFilter = "true";
      viewForm.append(input);
    });
  };
  const updateReset = (): void => {
    syncViewForm();
    const data = new FormData(form);
    const filtered =
      ["q", "category", "level", "submissionId"].some(
        (name) =>
          !!data.get(name) && !(name !== "q" && data.get(name) === "all"),
      ) || !!Number(data.get("formId"));
    reset?.classList.toggle("disabled", !filtered);
    reset?.setAttribute("aria-disabled", String(!filtered));
    if (reset) reset.tabIndex = filtered ? 0 : -1;
  };
  const cancel = (): void => {
    clearTimeout(timer);
    ++generation;
    request?.abort();
    request = undefined;
    busy(false);
  };
  const load = async (
    url: URL,
    addHistory: boolean,
    scrollResults = false,
  ): Promise<void> => {
    cancel();
    const current = generation;
    request = new AbortController();
    busy(true);
    message("loading");
    if (apply) apply.hidden = true;
    try {
      const response = await fetch(url.href, {
        signal: request.signal,
        credentials: "same-origin",
        headers: { Accept: "text/html", "X-Freeform-Activity-Results": "1" },
      });
      if (!response.ok) throw new Error("Activity update failed");
      const html = await response.text();
      if (current !== generation) return;
      const next = new DOMParser()
        .parseFromString(html, "text/html")
        .querySelector<HTMLElement>("[data-activity-results]");
      if (!next) throw new Error("Activity results unavailable");
      results?.replaceWith(next);
      results = next;
      bindResults(next);
      if (scrollResults) {
        next.scrollIntoView?.({ block: "start", behavior: "auto" });
        next.focus({ preventScroll: true });
      }
      displayedFilters = urlForForm().href;
      if (addHistory && url.href !== window.location.href)
        window.history.pushState(null, "", url);
      updateReset();
      message("complete");
    } catch {
      if (current !== generation) return;
      message("error");
      if (apply) apply.hidden = false;
    } finally {
      if (current === generation) busy(false);
    }
  };
  const changed = (immediate: boolean): void => {
    cancel();
    updateReset();
    const url = urlForForm();
    if (url.href === displayedFilters) {
      if (apply) apply.hidden = true;
      message("complete");
      return;
    }
    if (immediate) void load(url, true);
    else timer = setTimeout(() => void load(url, true), 350);
  };
  const onInput = (): void => changed(false);
  const onChange = (): void => {
    form.querySelectorAll<SearchableSelect>("select").forEach((select) => {
      if (select.value !== "") return;
      const value = select.name === "formId" ? "0" : "all";
      if (select.selectize) select.selectize.setValue(value, true);
      else select.value = value;
    });
    changed(true);
  };
  const onSubmit = (event: Event): void => {
    event.preventDefault();
    void load(urlForForm(), true);
  };
  const restore = (url: URL): void => {
    if (search) search.value = url.searchParams.get("q") || "";
    form.querySelectorAll<SearchableSelect>("select").forEach((select) => {
      const value =
        url.searchParams.get(select.name) ||
        (select.name === "formId" ? "0" : "all");
      if (select.selectize) select.selectize.setValue(value, true);
      else select.value = value;
    });
    const submission = form.querySelector<HTMLInputElement>(
      'input[name="submissionId"]',
    );
    if (submission) {
      submission.value = url.searchParams.get("submissionId") || "";
      submission.disabled = submission.value === "";
    }
  };
  const onPopState = (): void => {
    const url = new URL(window.location.href);
    restore(url);
    updateReset();
    void load(url, false);
  };
  const onReset = (event: Event): void => {
    event.preventDefault();
    if (reset?.getAttribute("aria-disabled") === "true") return;
    const url = new URL(reset?.href || form.action, window.location.href);
    restore(url);
    void load(urlForForm(), true);
  };

  const onViewClick = (event: Event): void => {
    const button =
      event.target instanceof Element
        ? event.target.closest<HTMLButtonElement>('button[name="view"]')
        : null;
    if (
      !button ||
      !viewForm ||
      button.value ===
        form.querySelector<HTMLInputElement>('input[name="view"]')?.value
    )
      return;
    // Craft.Listbox prevents the click's default submit. Submit explicitly after
    // its button handler has updated the native pressed state.
    event.preventDefault();
    cancel();
    viewForm.requestSubmit(button);
  };
  const onResultNavigation = (event: Event): void => {
    const link =
      event.target instanceof Element
        ? event.target.closest<HTMLAnchorElement>(".pagination a.page-link")
        : null;
    if (!link || !root.contains(link)) return;
    event.preventDefault();
    void load(new URL(link.href, window.location.href), true, true);
  };
  root.addEventListener("click", onResultNavigation);
  viewForm?.addEventListener("click", onViewClick);

  const menuSelections = Array.from(
    form.querySelectorAll<SearchableSelect>("select"),
  ).map((select) => {
    const markSelected = (): void => {
      const menu = select.selectize?.$dropdown?.[0];
      menu
        ?.querySelectorAll<HTMLElement>(".option[data-value]")
        .forEach((option) => {
          const selected = option.dataset.value === select.value;
          option.classList.toggle("selected", selected);
          option.setAttribute("aria-selected", String(selected));
        });
    };
    select.addEventListener("selectizedropdownopen", markSelected);
    return () =>
      select.removeEventListener("selectizedropdownopen", markSelected);
  });
  search?.addEventListener("input", onInput);
  form.addEventListener("submit", onSubmit);
  reset?.addEventListener("click", onReset);
  if ($) $(form).on("change.freeformActivity", "select", onChange);
  else form.addEventListener("change", onChange);
  window.addEventListener("popstate", onPopState);
  window.addEventListener("pagehide", cancel);
  if (apply) apply.hidden = true;
  updateReset();

  return () => {
    cancel();
    search?.removeEventListener("input", onInput);
    form.removeEventListener("submit", onSubmit);
    reset?.removeEventListener("click", onReset);
    if ($) $(form).off(".freeformActivity");
    else form.removeEventListener("change", onChange);
    window.removeEventListener("popstate", onPopState);
    window.removeEventListener("pagehide", cancel);
    viewForm?.removeEventListener("click", onViewClick);
    root.removeEventListener("click", onResultNavigation);
    menuSelections.forEach((remove) => {
      remove();
    });
  };
}
