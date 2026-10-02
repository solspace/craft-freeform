import { initializeSettingsControls } from "./controls";
import { loadFormattingTemplatesScript } from "./templates.formatting";
import { loadTemplatesModeScript } from "./templates.mode";

// eslint-disable no-undef
$(() => {
  loadFormattingTemplatesScript();
  loadTemplatesModeScript();
  initializeSettingsControls();

  const sessionTime = $("#session-time");
  const sessionCount = $("#session-count");
  const sessionSecret = $("#session-secret");

  const sessionContext = $("select#session-context");
  sessionContext.on({
    change: function () {
      const self = $(this);
      const value = self.val();

      switch (value) {
        case "payload":
          sessionSecret.removeClass("hidden");
          sessionCount.addClass("hidden");
          sessionTime.addClass("hidden");

          break;

        case "session":
        case "database":
          sessionSecret.addClass("hidden");
          sessionCount.removeClass("hidden");
          sessionTime.removeClass("hidden");

          break;
      }
    },
  });

  const spamProtectionBehavior = $("select#spam-protection-behavior");
  spamProtectionBehavior.on({
    change: function () {
      const customError = $("#custom-spam-error-message");
      if ($(this).val() === "display_errors") {
        customError.show("fast");
      } else {
        customError.hide("fast");
      }
    },
  });

  const filesDirectory = $("#files-directory");
  const templateDefault = $("#template-default");
  $("#storage-type").on({
    change: (event) => {
      const { value } = event.target;

      const isFiles = ["files", "files_database"].includes(value);

      filesDirectory.toggleClass("hidden", !isFiles);
      templateDefault
        .toggleClass("combined", value === "files_database")
        .trigger("change");
    },
  });

  templateDefault.on("change", () => {
    const isBoth =
      templateDefault.hasClass("combined") &&
      templateDefault.hasClass("builder-templates");
    templateDefault.toggleClass("hidden", !isBoth);
  });

  const notificationsMigrator = $("#notifications-migrator");
  if (notificationsMigrator) {
    const button = $("#migrate", notificationsMigrator);

    button.on({
      click: (event) => {
        if (
          !confirm(
            "Are you sure you want to migrate database notifications to file based ones?",
          )
        ) {
          event.preventDefault();
          event.stopPropagation();
          return false;
        }

        const removeDbNotifications = $(
          "#remove-files",
          notificationsMigrator,
        ).is(":checked");

        $.ajax({
          url: Craft.getCpUrl("freeform/migrate/notifications/db-to-file"),
          type: "post",
          dataType: "json",
          contentType: "application/json",
          data: JSON.stringify({
            removeDbNotifications,
            [Craft.csrfTokenName]: Craft.csrfTokenValue,
          }),
          success: (response) => {
            if (response.success) {
              notificationsMigrator.html(
                $(`<div class="pane">
                  <p>
                    <span class="checkmark-icon"></span>
                    Migrated successfully
                  </p>
                </div>
                `),
              );
            }
          },
        });

        event.preventDefault();
        event.stopPropagation();
        return false;
      },
    });
  }

  $(".lock-button").on("click", function () {
    const input = $("input", this);
    input.val(input.val() === "1" ? "0" : "1");
    input.toggleClass("locked", input.val() === "1");
  });
});
