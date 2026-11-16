$(() => {
  document.querySelectorAll("[data-notification-menu]").forEach((button) => {
    const row = button.closest("tr");
    const type = button.dataset.notificationType;
    let pending = false;

    new Garnish.MenuBtn($(button), {
      onOptionSelect: async (option) => {
        const action = option.dataset.notificationAction;
        if (pending || !["duplicate", "delete"].includes(action)) return;
        if (
          action === "delete" &&
          !confirm(
            Craft.t("freeform", 'Are you sure you want to delete "{name}"?', {
              name: row.dataset.name,
            }),
          )
        )
          return;

        pending = true;
        button.disabled = true;
        row.setAttribute("aria-busy", "true");
        try {
          const response = await Craft.sendActionRequest(
            "POST",
            `freeform/notifications/${type}/${action}`,
            { data: { id: row.dataset.id } },
          );
          if (!response.data.success) throw new Error("Unsuccessful response");
          if (action === "duplicate") {
            window.location.reload();
          } else {
            const table = row.closest("table");
            row.remove();
            if (!table.querySelector("tbody tr")) {
              table.closest(".tablepane").hidden = true;
              document.querySelector("[data-notification-empty]").hidden =
                false;
            }
          }
        } catch {
          Craft.cp.displayError(
            action === "duplicate"
              ? Craft.t("freeform", "Could not duplicate this template.")
              : Craft.t("freeform", "Could not delete this template."),
          );
        } finally {
          pending = false;
          button.disabled = false;
          row.removeAttribute("aria-busy");
        }
      },
    });
  });
});
