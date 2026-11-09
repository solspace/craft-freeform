import { initColorPickers } from "../../../lib/color-picker";
import { initDigestSchedules } from "./digest-schedule";
import { initScriptInsertLocation } from "./script.location";
import { loadBuilderTemplatesScript } from "./templates.builder";
import { loadFormattingTemplatesScript } from "./templates.formatting";
import {
  loadTemplateStorageScript,
  loadTemplatesModeScript,
} from "./templates.mode";
import { initToolbarEditors } from "./toolbar";

// eslint-disable no-undef
$(() => {
  loadBuilderTemplatesScript();
  initColorPickers();
  loadFormattingTemplatesScript();
  loadTemplatesModeScript();
  initToolbarEditors();
  initDigestSchedules();

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

  const purgeToggle = $("input[name='purge-toggle']").parents(".lightswitch");
  purgeToggle.on({
    change: function () {
      const isOn = $("input", this).val();
      if (!isOn) {
        $("select#purge-value").val(0);
      }
    },
  });

  initScriptInsertLocation();

  const templateDefault = $("#template-default");
  loadTemplateStorageScript();

  $("#allow-builder-templates").on({
    change: (event) => {
      // biome-ignore lint/suspicious/noDoubleEquals: We want type coercion here
      const checked = $("input", event.target).val() == "1";
      templateDefault
        .toggleClass("builder-templates", checked)
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
