import {
  mountNativeSubmissionStatuses,
  normalizeNativeStatusOptions,
} from "@lib/cp/native-submission-status";
import {
  bindNotificationRecipients,
  notificationTemplateMode,
  selectedNotificationEmails,
} from "@lib/cp/notification-recipients";
import { bindSpamReviewActions } from "@lib/cp/spam-review";
import { bindSubmissionUndo } from "@lib/cp/submission-undo";

/** Craft 6 renders the index itself; bind only Freeform's toolbar and review controls. */
export function mountNativeSubmissionTools(api, root = document) {
  const mounted = new WeakSet();
  const boundRows = new WeakSet();
  let undo;
  const translate = (message) => api.t(message, {}, "freeform");
  const notify = (type, message) =>
    type === "success" ? api.showSuccess(message) : api.showError(message);
  const refresh = async () => window.location.reload();
  const post = async (action, data) => {
    const response = await api.actionClient.post(action, data);
    if (!response.data.success) throw new Error("Submission action failed");
    return response.data;
  };

  const mount = () => {
    const toolbar = root.querySelector("[data-freeform-native-index]");
    if (!toolbar) return;
    normalizeNativeStatusOptions(root);
    mountNativeSubmissionStatuses(root, {
      statuses: JSON.parse(toolbar.dataset.statuses || "[]"),
      saveStatus: async (submissionId, statusId) => {
        const data = await post(
          toolbar.dataset.spam === "true"
            ? "freeform/spam-submissions/set-status"
            : "freeform/submissions/set-status",
          { submissionId, statusId },
        );
        undo?.setHistory(data.undoHistory);
      },
      refresh: async (id) => {
        sessionStorage.setItem("freeform-status-focus", id);
        await refresh();
      },
      notify,
      translate,
    });
    const focusId = sessionStorage.getItem("freeform-status-focus");
    if (focusId) {
      const button = [
        ...root.querySelectorAll("[data-freeform-submission-status]"),
      ]
        .find((label) => label.dataset.submissionId === focusId)
        ?.querySelector("button");
      if (button) {
        sessionStorage.removeItem("freeform-status-focus");
        button.focus({ preventScroll: true });
      }
    }
    if (!mounted.has(toolbar)) {
      mounted.add(toolbar);
      undo?.destroy();
      const button = toolbar.querySelector("[data-freeform-index-undo]");
      undo = bindSubmissionUndo(button, {
        requestUndo: (token) => post("freeform/submissions/undo", { token }),
        loadHistory: async () => {
          const response = await api.actionClient.get(
            "freeform/submissions/undo-history",
          );
          return response.data.undoHistory;
        },
        refresh,
        notify,
        translate,
      });
      void undo.sync();
      toolbar
        .querySelector('[name="spamReason"]')
        ?.addEventListener("change", (event) => {
          const url = new URL(window.location.href);
          url.searchParams.delete("page");
          if (event.target.value)
            url.searchParams.set("spamReason", event.target.value);
          else url.searchParams.delete("spamReason");
          window.location.assign(url);
        });
      toolbar
        .querySelector("[data-freeform-quick-export]")
        ?.addEventListener("click", (event) => {
          openNativeQuickExport(
            api,
            event.currentTarget,
            toolbar.dataset.spam === "true",
          ).catch(() => {
            notify("error", translate("Could not open Quick Export."));
          });
        });
    }
    for (const row of root.querySelectorAll("[data-spam-review-id]")) {
      if (boundRows.has(row)) continue;
      boundRows.add(row);
      // The shared binder accepts a container, and binds its review groups.
      bindSpamReviewActions(
        { querySelectorAll: () => [row] },
        {
          request: async (submissionId, operation) => {
            const response = await post("freeform/spam-submissions/review", {
              submissionId,
              operation,
            });
            undo?.setHistory(response.undoHistory);
          },
          refresh,
          notify,
          translate,
        },
      );
    }
  };
  const observer = new MutationObserver(mount);
  let openingNotification = false;
  const onNotification = async (event) => {
    const ids = event.detail?.elementIds;
    if (!Array.isArray(ids) || !ids.length || openingNotification) return;
    openingNotification = true;
    try {
      await openNativeNotificationDialog(api, ids);
    } catch (error) {
      notify(
        "error",
        error.response?.data?.message ||
          translate(
            "Unable to load notification recipients. Please try again.",
          ),
      );
    } finally {
      openingNotification = false;
    }
  };
  window.addEventListener("freeform:send-notifications", onNotification);
  observer.observe(root.documentElement ?? root, {
    childList: true,
    subtree: true,
  });
  mount();
  return () => {
    observer.disconnect();
    undo?.destroy();
    window.removeEventListener("freeform:send-notifications", onNotification);
  };
}

export async function openNativeNotificationDialog(api, ids) {
  if (document.querySelector(".ff-native-notification-dialog")) return;
  const trigger = document.activeElement;
  const { data } = await api.http.post(
    api.getCpUrl("freeform/notifications/send-notification-dialogue"),
    { submissionIds: ids },
  );
  const dialog = document.createElement("dialog");
  dialog.className = "ff-native-notification-dialog";
  dialog.innerHTML = data;
  dialog.querySelectorAll("script").forEach((script) => {
    script.remove();
  });
  const form = dialog.querySelector("form");
  const title = form.querySelector("[data-notification-title]");
  title.id = "ff-native-notification-title";
  dialog.setAttribute("aria-labelledby", title.id);
  bindNotificationRecipients(form);
  let sending = false;
  const controls = [...form.querySelectorAll(".footer button")];
  for (const original of controls) {
    const button = document.createElement("craft-button");
    const submit = original.type === "submit";
    button.setAttribute("type", "button");
    button.setAttribute("variant", submit ? "primary" : "fill");
    button.textContent = original.textContent;
    button.addEventListener("click", () => {
      if (sending) return;
      if (submit) form.requestSubmit();
      else dialog.close();
    });
    original.replaceWith(button);
  }
  dialog.addEventListener("cancel", (event) => {
    if (sending) event.preventDefault();
  });
  dialog.addEventListener(
    "close",
    () => {
      dialog.remove();
      trigger?.focus();
    },
    { once: true },
  );
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (sending) return;
    const selectedEmails = selectedNotificationEmails(form);
    const emails = form.querySelector('[name="emails"]').value;
    if (!selectedEmails.length && !emails.trim()) {
      api.showError(
        api.t("Select a recipient or enter an email address.", {}, "freeform"),
      );
      return;
    }
    const buttons = [...dialog.querySelectorAll(".footer craft-button")];
    sending = true;
    buttons.forEach((button) => {
      button.disabled = true;
    });
    buttons.at(-1).loading = true;
    try {
      await api.http.post(
        api.getCpUrl("freeform/notifications/send-notification"),
        {
          submissionIds: ids,
          templateMode: notificationTemplateMode(form),
          template: form.querySelector('select[name="template"]')?.value || "",
          emails,
          selectedEmails,
        },
      );
      dialog.close();
      api.showSuccess(
        api.t("Notifications sent successfully.", {}, "freeform"),
      );
    } catch (error) {
      const response = error.response?.data;
      api.showError(
        response?.message ||
          (typeof response === "string"
            ? response
            : api.t(
                "Unable to send notifications. Please try again.",
                {},
                "freeform",
              )),
      );
    } finally {
      sending = false;
      buttons.forEach((button) => {
        button.disabled = false;
      });
      buttons.at(-1).loading = false;
    }
  });
  document.body.append(dialog);
  dialog.showModal();
  title.focus();
}

export async function openNativeQuickExport(api, trigger, isSpam) {
  if (trigger.disabled) return;
  trigger.disabled = true;
  try {
    const source = new URL(window.location.href).searchParams.get("source");
    const formId = /^form:\d+$/.test(source ?? "") ? source.slice(5) : null;
    const url = new URL(
      api.getCpUrl("freeform/export/export-dialogue"),
      window.location.origin,
    );
    url.searchParams.set("isSpam", String(isSpam));
    if (formId) url.searchParams.set("formId", formId);
    const { data } = await api.http.get(url.href);
    const dialog = document.createElement("dialog");
    dialog.className = "ff-native-export-dialog";
    dialog.setAttribute("aria-labelledby", "ff-native-export-title");
    dialog.innerHTML = data;
    dialog.querySelector("h1").id = "ff-native-export-title";
    // This trusted server fragment's legacy inline scripts aren't executed.
    // Bind the form switch and lifecycle directly to the native dialog instead.
    dialog.querySelectorAll("script").forEach((script) => {
      script.remove();
    });
    const form = dialog.querySelector("form");
    form.action = api.getCpUrl("freeform/export/quick-export");
    const actionInput = form.querySelector('[name="action"]');
    actionInput?.remove();
    const selector = form.querySelector('select[name="form_id"]');
    const updateFields = () =>
      form.querySelectorAll(".form-field-list").forEach((list) => {
        list.hidden = list.dataset.id !== selector.value;
        list.querySelectorAll("input").forEach((input) => {
          input.disabled = list.hidden;
        });
      });
    selector.addEventListener("change", updateFields);
    updateFields();
    for (const input of dialog.querySelectorAll(".footer input.btn")) {
      const button = document.createElement("craft-button");
      button.setAttribute("type", "button");
      button.setAttribute(
        "variant",
        input.classList.contains("submit") ? "primary" : "fill",
      );
      button.textContent = input.value;
      button.addEventListener("click", () =>
        input.classList.contains("submit")
          ? form.requestSubmit()
          : dialog.close(),
      );
      input.replaceWith(button);
    }
    dialog.addEventListener(
      "close",
      () => {
        dialog.remove();
        trigger.focus();
      },
      { once: true },
    );
    form.addEventListener("submit", () => {
      setTimeout(() => dialog.close(), 0);
    });
    document.body.append(dialog);
    dialog.showModal();
    selector.focus();
  } finally {
    trigger.disabled = false;
  }
}
