import { initColorPickers } from "../../../lib/color-picker";
import { whenCpReady } from "../../../lib/cp/ready";
import { initializeSettingsControls } from "./controls";
import { initDigestSchedules } from "./digest-schedule";
import { initializeFormBuilderSettings } from "./form-builder-settings";
import { initScriptInsertLocation } from "./script.location";
import { loadFormattingTemplatesScript } from "./templates.formatting";
import {
  loadTemplateStorageScript,
  loadTemplatesModeScript,
} from "./templates.mode";
import { initToolbarEditors } from "./toolbar";

// eslint-disable no-undef
whenCpReady(() => {
  initColorPickers();
  loadFormattingTemplatesScript();
  loadTemplatesModeScript();
  initializeSettingsControls();
  initializeFormBuilderSettings();
  initToolbarEditors();
  initDigestSchedules();

  initScriptInsertLocation();
  const templateDefault = $("#template-default");
  loadTemplateStorageScript();

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
});
