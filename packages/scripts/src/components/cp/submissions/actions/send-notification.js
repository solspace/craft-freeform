// eslint-disable no-undef

import {
  bindNotificationRecipients,
  notificationTemplateMode,
  selectedNotificationEmails,
} from "@lib/cp/notification-recipients";

window.freeform_notify = (ids) => {
  const content = $(
    '<div id="notification-modal-wrapper" class="modal fitted">',
  );

  let form;

  $.ajax({
    url: Craft.getCpUrl("freeform/notifications/send-notification-dialogue"),
    type: "post",
    data: {
      submissionIds: ids,
      [Craft.csrfTokenName]: Craft.csrfTokenValue,
    },
    dataType: "html",
    success: (response) => {
      content.html(response);

      const modal = new Garnish.Modal(content, {
        onFadeIn: () => {
          form
            ?.querySelector("[data-notification-title]")
            ?.focus({ preventScroll: true });
        },
        onFadeOut: () => modal.destroy(),
      });

      form = content.find("form").get(0);
      bindNotificationRecipients(form, () => modal.updateSizeAndPosition());
      let sending = false;
      const close = () => {
        modal.hide();
      };

      $(".btn.cancel", content).on({
        click: () => {
          if (!sending) close();
        },
      });

      form.addEventListener("submit", (event) => {
        event.stopPropagation();
        event.preventDefault();

        if (sending) return false;
        const selectedEmails = selectedNotificationEmails(form);
        if (!selectedEmails.length && !form.emails.value.trim()) {
          Craft.cp.displayError(
            Craft.t(
              "freeform",
              "Select a recipient or enter an email address.",
            ),
          );
          return false;
        }

        const data = {
          template: form.template.value,
          templateMode: notificationTemplateMode(form),
          emails: form.emails.value,
          selectedEmails,
          submissionIds: ids,
          [Craft.csrfTokenName]: Craft.csrfTokenValue,
        };

        sending = true;
        content.find(".btn").prop("disabled", true);
        content.find(".spinner").show();
        $.ajax({
          url: Craft.getCpUrl("freeform/notifications/send-notification"),
          type: "post",
          data,
          success: () => {
            close();

            Craft.cp.displaySuccess(
              Craft.t("freeform", "Notifications sent successfully."),
            );
          },
          error: (error) => {
            Craft.cp.displayError(
              error.responseJSON?.message ||
                error.responseJSON ||
                Craft.t(
                  "freeform",
                  "Unable to send notifications. Please try again.",
                ),
            );
          },
          complete: () => {
            sending = false;
            content.find(".btn").prop("disabled", false);
            content.find(".spinner").hide();
          },
        });

        return false;
      });
    },
    error: () => {
      content.remove();
      Craft.cp.displayError(
        Craft.t(
          "freeform",
          "Unable to load notification recipients. Please try again.",
        ),
      );
    },
  });
};
