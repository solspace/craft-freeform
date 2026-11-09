export function initDemoInstaller(root) {
  if (!root) return;

  for (const preview of root.querySelectorAll("[data-file-preview]")) {
    const toggle = preview.querySelector("[data-view-files]");
    if (!toggle) continue;
    preview.classList.add("is-collapsed");
    toggle.hidden = false;
    toggle.addEventListener("click", () => {
      const collapsed = preview.classList.toggle("is-collapsed");
      toggle.setAttribute("aria-expanded", String(!collapsed));
      toggle.textContent = Craft.t(
        "freeform",
        collapsed ? "View all files" : "Show fewer files",
      );
    });
  }

  const form = root.querySelector("#demo-install-form");
  const prefix = root.querySelector("#prefix");
  if (!form || !prefix) return;

  const submit = form.querySelector('[type="submit"]');
  const prefixError = root.querySelector("[data-prefix-error]");
  if (prefixError) {
    prefix.setAttribute(
      "aria-describedby",
      `${prefix.getAttribute("aria-describedby") || ""} ${prefixError.id}`.trim(),
    );
  }
  const setup = root.querySelector("[data-install-setup]");
  const progress = root.querySelector("[data-install-progress]");
  const error = root.querySelector("[data-install-error]");
  const result = root.querySelector("[data-install-result]");
  const readOnly = form.dataset.readOnly === "true";
  const invalidMessage = Craft.t(
    "freeform",
    "Enter a folder name using letters, numbers, hyphens, underscores, or dots. Start with a letter or number.",
  );
  const warning = root.querySelector("[data-existing-templates]");
  const checkStatus = root.querySelector(".freeform-demo-check-status");
  const checkMessage = root.querySelector("[data-destination-status]");
  const retryCheck = root.querySelector("[data-retry-destination]");
  let checkedPrefix = form.dataset.checkedPrefix || prefix.value;
  let checking = false;
  let checkFailed = false;
  let checkTimer;
  let checkController;
  let checkRevision = 0;
  let busy = false;

  function updatePrefix() {
    const value = prefix.value;
    prefix.setCustomValidity(
      /^[\p{L}\p{N}][\p{L}\p{N}._-]*$/u.test(value) ? "" : invalidMessage,
    );
    for (const label of root.querySelectorAll("[data-prefix]")) {
      label.textContent = value;
    }
    for (const label of root.querySelectorAll("[data-name]")) {
      label.textContent = value + label.dataset.name;
    }
    if (prefixError) prefixError.hidden = prefix.validity.valid;
    prefix.setAttribute("aria-invalid", String(!prefix.validity.valid));
    submit.disabled =
      readOnly || busy || checking || checkFailed || !prefix.validity.valid;

    submit.classList.toggle("disabled", submit.disabled);
  }

  function scheduleDestinationCheck(delay = 250) {
    clearTimeout(checkTimer);
    checkController?.abort();
    const revision = ++checkRevision;
    const value = prefix.value;
    warning.hidden = true;
    checkFailed = false;
    checking = !readOnly && prefix.validity.valid;
    checkStatus.hidden = !checking;
    retryCheck.hidden = true;
    updatePrefix();
    if (!checking) return;

    checkMessage.textContent = Craft.t("freeform", "Checking folder…");
    checkTimer = setTimeout(async () => {
      const controller = new AbortController();
      checkController = controller;
      const timeout = setTimeout(() => controller.abort(), 10000);
      const data = new FormData(form);
      data.set("action", "freeform/codepack/check-destination");
      data.set("prefix", value);
      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: data,
          credentials: "same-origin",
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
        });
        const payload = await response.json();
        if (!response.ok || typeof payload.templatesExist !== "boolean") {
          throw new Error("Invalid destination check response");
        }
        if (revision !== checkRevision) return;
        checkedPrefix = value;
        warning.hidden = !payload.templatesExist;
        checkStatus.hidden = true;
      } catch {
        if (revision !== checkRevision) return;
        checkFailed = true;
        checkMessage.textContent = Craft.t(
          "freeform",
          "Couldn’t check this folder. Retry the check before installing.",
        );
        retryCheck.hidden = false;
      } finally {
        clearTimeout(timeout);
        if (revision === checkRevision) {
          checking = false;
          updatePrefix();
        }
      }
    }, delay);
  }

  prefix.addEventListener("input", () => {
    updatePrefix();
    scheduleDestinationCheck();
  });
  retryCheck.addEventListener("click", () => scheduleDestinationCheck(0));
  updatePrefix();
  if (prefix.value !== checkedPrefix) scheduleDestinationCheck(0);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (busy || readOnly || checking || checkFailed || !form.reportValidity())
      return;
    if (prefix.value !== checkedPrefix) {
      scheduleDestinationCheck(0);
      return;
    }

    const data = new FormData(form);
    busy = true;
    submit.disabled = true;
    setup.hidden = true;
    error.hidden = true;
    result.hidden = true;
    progress.hidden = false;
    root.setAttribute("aria-busy", "true");
    progress.focus();

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: data,
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });
      const payload = await response.json();
      if (!response.ok || !payload.success || !payload.html) {
        throw new Error(
          payload.message ||
            Craft.t(
              "freeform",
              "Installation could not be completed. Check your folder permissions and try again.",
            ),
        );
      }
      result.innerHTML = payload.html;
      result.hidden = false;
    } catch (exception) {
      // A lost response does not mean the server stopped installing. Never retry automatically.
      error.textContent = Craft.t(
        "freeform",
        "Installation could not be confirmed. Check the demo folder before trying again.",
      );
      if (exception instanceof Error && exception.name === "Error") {
        error.textContent = exception.message;
      }
      setup.hidden = false;
      error.hidden = false;
    } finally {
      busy = false;
      progress.hidden = true;
      root.removeAttribute("aria-busy");
      updatePrefix();
      (error.hidden ? result : error).focus();
    }
  });
}

const initialize = () =>
  initDemoInstaller(document.getElementById("demo-installer"));
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize, { once: true });
} else {
  initialize();
}
