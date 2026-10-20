(() => {
  let activeDropdown = null;
  let nextId = 0;

  const normalize = (value) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase();

  // Explicit template URLs win. Only the bare Forms overview restores a choice.
  // Validate against this installation's options before using browser storage.
  document.querySelectorAll("[data-demo-preview]").forEach((header) => {
    const storageKey = "freeform-demo-preview-template";
    const formsUrl = new URL(header.dataset.demoFormsUrl, window.location.href);
    const choices = [...header.querySelectorAll(".freeform-nav-template-option")]
      .map((link) => new URL(link.href).pathname.slice(formsUrl.pathname.length + 1).split("/")[0]);
    try {
      const saved = localStorage.getItem(storageKey);
      if (header.hasAttribute("data-demo-preview-implicit") && choices.includes(saved)) {
        if (saved !== header.dataset.demoPreview) {
          formsUrl.pathname += `/${saved}`;
          formsUrl.search = window.location.search;
          formsUrl.hash = window.location.hash;
          window.location.replace(formsUrl.href);
        }
      } else if (choices.includes(header.dataset.demoPreview)) {
        localStorage.setItem(storageKey, header.dataset.demoPreview);
      }
    } catch {
      // Basic Light remains the initial preview when storage is unavailable.
    }
  });

  document.querySelectorAll("[data-demo-navigation]").forEach((header) => {
    const toggle = header.querySelector("[data-demo-menu-toggle]");
    const main = header.querySelector(".freeform-nav-main");
    if (!toggle || !main || header.dataset.menuEnhanced) return;
    const close = (restoreFocus = false) => {
      delete header.dataset.menuOpen;
      toggle.setAttribute("aria-expanded", "false");
      if (restoreFocus) toggle.focus({ preventScroll: true });
    };
    toggle.addEventListener("click", () => {
      if (header.hasAttribute("data-menu-open")) close();
      else {
        header.dataset.menuOpen = "true";
        toggle.setAttribute("aria-expanded", "true");
      }
    });
    header.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && header.hasAttribute("data-menu-open")) {
        event.preventDefault();
        close(true);
      }
    });
    document.addEventListener("pointerdown", (event) => {
      if (!main.contains(event.target)) close();
    });
    main.addEventListener("focusout", (event) => {
      if (event.relatedTarget && !main.contains(event.relatedTarget)) close();
    });
    header.dataset.menuEnhanced = "true";
  });

  document.querySelectorAll("[data-submissions-browser]").forEach((browser) => {
    const search = browser.querySelector("[data-submissions-search]");
    const tools = browser.querySelector("[data-submissions-tools]");
    if (!search || !tools || browser.dataset.enhanced) return;
    const rows = [...browser.querySelectorAll("[data-submission-row]")];
    const text = new Map(rows.map((row) => [row, normalize(row.textContent)]));
    const status = browser.querySelector("[data-submissions-status]");
    const empty = browser.querySelector("[data-submissions-empty]");
    const filter = () => {
      const words = normalize(search.value).trim().split(/\s+/).filter(Boolean);
      rows.forEach((row) => {
        row.hidden = !words.every((word) => text.get(row).includes(word));
      });
      const count = rows.filter((row) => !row.hidden).length;
      status.textContent = words.length
        ? `${count} of ${rows.length} on this page`
        : `${rows.length} on this page · Newest first`;
      empty.hidden = count !== 0;
    };
    search.addEventListener("input", filter);
    browser.querySelector("[data-submissions-clear]")?.addEventListener("click", () => {
      search.value = "";
      filter();
      search.focus();
    });
    tools.hidden = false;
    browser.dataset.enhanced = "true";
  });

  document.querySelectorAll("[data-form-browser]").forEach((browser) => {
    const search = browser.querySelector("[data-browser-search]");
    const tools = browser.querySelector("[data-browser-tools]");
    if (!search || !tools || browser.dataset.enhanced) return;
    const items = [...browser.querySelectorAll("[data-browser-item]")];
    const groups = [...browser.querySelectorAll("[data-browser-group]")].map((element) => ({
      element,
      items: [...element.querySelectorAll("[data-browser-item]")],
      count: element.querySelector("[data-browser-group-count]"),
    }));
    const buttons = [...browser.querySelectorAll("[data-browser-view]")];
    const status = browser.querySelector("[data-browser-status]");
    const empty = browser.querySelector("[data-browser-empty]");
    const searchText = new Map(
      items.map((item) => [item, normalize(item.dataset.browserSearch || item.dataset.formSearch || "")]),
    );
    const storageKey = "freeform-demo-form-view";
    const setView = (view) => {
      browser.dataset.view = view === "list" ? "list" : "cards";
      buttons.forEach((button) => {
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.browserView === browser.dataset.view),
        );
      });
    };
    try {
      setView(localStorage.getItem(storageKey));
    } catch {
      setView("cards");
    }
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        setView(button.dataset.browserView);
        try {
          localStorage.setItem(storageKey, browser.dataset.view);
        } catch {
          // The switcher also works when browser storage is unavailable.
        }
      });
    });
    const filter = () => {
      const words = normalize(search.value).trim().split(/\s+/).filter(Boolean);
      items.forEach((item) => {
        item.hidden = !words.every((word) => searchText.get(item).includes(word));
      });
      groups.forEach((group) => {
        const count = group.items.filter((item) => !item.hidden).length;
        group.element.hidden = count === 0;
        if (group.count) group.count.textContent = String(count);
      });
      const count = items.filter((item) => !item.hidden).length;
      status.textContent = `${count} of ${items.length} ${browser.dataset.browserNoun || "forms"}`;
      status.hidden = words.length === 0;
      empty.hidden = count !== 0;
    };
    search.addEventListener("input", filter);
    browser.querySelector("[data-browser-clear]")?.addEventListener("click", () => {
      search.value = "";
      filter();
      search.focus();
    });
    tools.hidden = false;
    browser.dataset.enhanced = "true";
    filter();
  });

  document.querySelectorAll(".freeform-nav-dropdown").forEach((dropdown) => {
    const button = dropdown.querySelector(".freeform-nav-button");
    const panel = dropdown.querySelector(".freeform-nav-dropdown-content");
    if (!button || !panel || dropdown.dataset.enhanced) return;

    const label = dropdown.dataset.dropdownLabel || "Navigation";
    const selection = document.createElement("span");
    selection.className = "freeform-nav-selection";
    const selectionLabel = document.createElement("span");
    selectionLabel.className = "freeform-nav-selection-label";
    const selectionIcon = button.querySelector(".freeform-template-icon, .freeform-form-circle");
    if (selectionIcon) selection.append(selectionIcon);
    selectionLabel.append(...button.childNodes);
    selection.append(selectionLabel);
    button.append(selection);
    const links = [...panel.querySelectorAll("a")];
    const searchText = new Map(
      links.map((link) => [link, normalize(link.textContent)]),
    );
    const list = document.createElement("div");
    list.className = "freeform-nav-results";
    list.append(...panel.childNodes);

    const search = document.createElement("input");
    search.type = "search";
    search.className = "freeform-nav-search";
    search.placeholder = `Search ${label.toLocaleLowerCase()}…`;
    search.setAttribute("aria-label", search.placeholder);
    search.autocomplete = "off";
    search.spellcheck = false;

    const searchBar = document.createElement("div");
    searchBar.className = "freeform-nav-search-bar";
    searchBar.append(search);

    const status = document.createElement("div");
    status.className = "freeform-nav-result-count";
    status.setAttribute("role", "status");

    const empty = document.createElement("p");
    empty.className = "freeform-nav-empty";
    empty.textContent = "No matches found. Try another search.";
    empty.hidden = true;
    list.append(empty);
    panel.append(searchBar, list, status);
    panel.id ||= `freeform-nav-dropdown-${++nextId}`;
    panel.setAttribute("role", "region");
    panel.setAttribute("aria-label", label);
    button.setAttribute("aria-controls", panel.id);
    button.setAttribute("aria-expanded", "false");
    dropdown.dataset.enhanced = "true";

    // Use the top layer when available so form/framework stacking contexts
    // cannot cover the navigation. Fixed positioning also works without it.
    const supportsPopover = typeof panel.showPopover === "function";
    if (supportsPopover) panel.setAttribute("popover", "manual");

    let open = false;
    let positionFrame = null;
    const visibleLinks = () => links.filter((link) => !link.hidden);

    const filter = () => {
      const words = normalize(search.value).trim().split(/\s+/).filter(Boolean);
      links.forEach((link) => {
        link.hidden = !words.every((word) =>
          searchText.get(link).includes(word),
        );
      });
      list.querySelectorAll("hr").forEach((divider) => {
        divider.hidden = words.length > 0;
      });
      const count = visibleLinks().length;
      empty.hidden = count > 0;
      status.textContent = `${count} of ${links.length} ${label.toLocaleLowerCase()}`;
      list.scrollTop = 0;
    };

    const position = () => {
      if (!open) return;
      const viewport = window.visualViewport;
      const viewportTop = viewport?.offsetTop || 0;
      const viewportLeft = viewport?.offsetLeft || 0;
      const width = viewport?.width || window.innerWidth;
      const height = viewport?.height || window.innerHeight;
      const rect = button.getBoundingClientRect();
      const gap = 6;
      const edge = 8;
      const below = viewportTop + height - rect.bottom - gap - edge;
      const above = rect.top - viewportTop - gap - edge;
      const upwards = below < 180 && above > below;
      const available = Math.max(0, upwards ? above : below);
      panel.style.width = `${Math.min(Math.max(300, rect.width), 420, width - edge * 2)}px`;
      panel.style.setProperty(
        "--freeform-dropdown-available-height",
        `${available}px`,
      );
      const panelRect = panel.getBoundingClientRect();
      panel.style.left = `${Math.max(viewportLeft + edge, Math.min(rect.left, viewportLeft + width - panelRect.width - edge))}px`;
      panel.style.top = `${upwards ? rect.top - gap - panelRect.height : rect.bottom + gap}px`;
    };

    const schedulePosition = () => {
      if (!open || positionFrame !== null) return;
      positionFrame = requestAnimationFrame(() => {
        positionFrame = null;
        position();
      });
    };

    const close = (restoreFocus = false) => {
      if (!open) return;
      open = false;
      button.setAttribute("aria-expanded", "false");
      if (supportsPopover) panel.hidePopover();
      delete dropdown.dataset.open;
      if (activeDropdown === close) activeDropdown = null;
      if (positionFrame !== null) cancelAnimationFrame(positionFrame);
      positionFrame = null;
      if (restoreFocus) button.focus({ preventScroll: true });
    };

    const focusLink = (link) => {
      if (!link) return;
      link.focus({ preventScroll: true });
      link.scrollIntoView({ block: "nearest" });
    };

    const show = () => {
      if (open) return;
      activeDropdown?.();
      activeDropdown = close;
      search.value = "";
      filter();
      open = true;
      dropdown.dataset.open = "true";
      button.setAttribute("aria-expanded", "true");
      if (supportsPopover) panel.showPopover();
      position();
      search.focus({ preventScroll: true });
      links
        .find((link) => link.hasAttribute("aria-current"))
        ?.scrollIntoView({ block: "nearest" });
    };

    button.addEventListener("click", () => (open ? close() : show()));
    search.addEventListener("input", () => {
      filter();
      position();
    });
    dropdown.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && open) {
        event.preventDefault();
        event.stopPropagation();
        close(true);
        return;
      }
      const arrow = event.key === "ArrowDown" || event.key === "ArrowUp";
      const boundary = event.key === "Home" || event.key === "End";
      if (!arrow && !(boundary && event.target.matches("a"))) return;
      event.preventDefault();
      show();
      const visible = visibleLinks();
      const index = visible.indexOf(document.activeElement);
      if (event.key === "Home") focusLink(visible[0]);
      else if (event.key === "End") focusLink(visible.at(-1));
      else if (event.key === "ArrowDown")
        focusLink(visible[(index + 1) % visible.length]);
      else focusLink(visible[index <= 0 ? visible.length - 1 : index - 1]);
    });
    dropdown.addEventListener("focusout", (event) => {
      // During native pointer focus changes activeElement can briefly be BODY.
      // Use the destination so moving from search to a link keeps it clickable.
      // Null destinations are covered by outside-pointer and Escape handling.
      if (event.relatedTarget && !dropdown.contains(event.relatedTarget)) close();
    });
    // Keep links visible through the browser's native activation. Hiding a
    // popover during the click can suppress navigation; navigation closes it.
    document.addEventListener("pointerdown", (event) => {
      if (!dropdown.contains(event.target)) close();
    });
    window.addEventListener("resize", schedulePosition);
    window.addEventListener("scroll", schedulePosition, true);
    window.visualViewport?.addEventListener("resize", schedulePosition);
    window.visualViewport?.addEventListener("scroll", schedulePosition);
    if (typeof ResizeObserver === "function") {
      const observer = new ResizeObserver(schedulePosition);
      observer.observe(button);
      observer.observe(dropdown.closest(".freeform-nav") || dropdown);
    }
    filter();
  });
})();
