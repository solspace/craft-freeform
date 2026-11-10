/** The server owns this user's session history; the button only presents its latest receipt. */
export function bindSubmissionUndo(button, options) {
  const { requestUndo, loadHistory, refresh, notify, translate } = options;
  let history = [];
  let version = 0;
  let busy = false;
  let disposed = false;
  let expiryTimer;
  const slot = button.closest(".ff-submission-undo-slot");

  const render = () => {
    if (disposed) return;
    clearTimeout(expiryTimer);
    history = history.filter((entry) => entry.expiresAt * 1000 > Date.now());
    const entry = history.at(-1);
    if (slot) {
      if (!entry && slot.contains(document.activeElement))
        options.focusFallback?.();
      slot.style.setProperty("--ff-undo-width", `${button.offsetWidth}px`);
      slot.classList.toggle("has-undo", !!entry);
      slot.setAttribute("aria-hidden", String(!entry));
      slot.inert = !entry;
    }
    button.disabled = busy || !entry;
    button.setAttribute("aria-busy", String(busy));
    const labels = {
      status: "Undo status change",
      approve: "Undo spam approval",
      delete: "Undo deletion",
    };
    button.title = entry
      ? `${translate(labels[entry.operation])}: ${entry.title}`
      : translate("Nothing to undo");
    if (entry?.operation === "approve") {
      button.title += ` — ${translate("Returns submissions to Spam. Sent notifications and completed integrations are not reversed.")}`;
    }
    if (history.length) {
      const expires = Math.min(
        ...history.map((entry) => entry.expiresAt * 1000),
      );
      expiryTimer = setTimeout(render, Math.max(1, expires - Date.now()));
    }
  };

  const setHistory = (entries) => {
    if (disposed || !Array.isArray(entries)) return;
    history = entries;
    version++;
    render();
  };

  const sync = async () => {
    if (disposed || busy) return;
    const started = version;
    try {
      const entries = await loadHistory();
      if (!disposed && !busy && started === version) setHistory(entries);
    } catch {
      // A focus refresh must not discard usable history on a network failure.
    }
  };

  const onClick = async () => {
    render();
    const entry = history.at(-1);
    if (busy || !entry || disposed) return;
    busy = true;
    const started = version;
    let observedVersion = started;
    render();
    try {
      const result = await requestUndo(entry.token);
      if (disposed) return;
      if (started === version) {
        setHistory(result.undoHistory);
        observedVersion = version;
      }
      notify(
        "success",
        translate(
          result.operation === "approve"
            ? "Spam approval undone. Sent notifications and completed integrations are not reversed."
            : "Action undone.",
        ),
      );
      try {
        await refresh();
      } catch {
        notify(
          "error",
          translate(
            "Action undone, but the list could not be refreshed. Reload the page to see the latest submissions.",
          ),
        );
      }
    } catch (error) {
      if (disposed) return;
      if (started === version) {
        setHistory(error.response?.data?.undoHistory);
        observedVersion = version;
      }
      notify(
        "error",
        error.response?.data?.message ||
          translate("Could not undo this action. Please try again."),
      );
    } finally {
      busy = false;
      render();
      // Another action may have completed while Undo was in flight.
      if (!disposed && observedVersion !== version) void sync();
    }
  };

  button.addEventListener("click", onClick);
  window.addEventListener("focus", sync);
  setHistory(options.initialHistory || []);

  return {
    setHistory,
    sync,
    destroy: () => {
      disposed = true;
      clearTimeout(expiryTimer);
      button.removeEventListener("click", onClick);
      window.removeEventListener("focus", sync);
      (slot || button).remove();
    },
  };
}
