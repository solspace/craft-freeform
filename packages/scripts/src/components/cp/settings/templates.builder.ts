import { csrfPaylaod } from "../../../utilities/ajax";

export const loadBuilderTemplatesScript = () => {
  const button = $("#add-builder-sample-template");
  if (!button.length) return;

  // @ts-expect-error Craft provides Garnish globally.
  new Garnish.MenuBtn(button, {
    onOptionSelect: (option: HTMLElement) => {
      button.prop("disabled", true).addClass("disabled");
      $.ajax(Craft.getCpUrl("freeform/api/templates/builder-sample"), {
        type: "post",
        dataType: "json",
        data: csrfPaylaod({ sample: $(option).data("sample") }),
      })
        .done(() => window.location.reload())
        .fail((response) => {
          const message =
            response.responseJSON?.message ??
            "Could not create the sample template.";
          Craft.cp.displayError(message);
        })
        .always(() => button.prop("disabled", false).removeClass("disabled"));
    },
  });
};
