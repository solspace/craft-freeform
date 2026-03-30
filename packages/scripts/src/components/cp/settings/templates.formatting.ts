import { csrfPaylaod } from "../../../utilities/ajax";

export const loadFormattingTemplatesScript = () => {
  // @ts-expect-error
  new Garnish.MenuBtn($("#add-formatting-template"), {
    onOptionSelect: (option: HTMLElement) => {
      const template = $(option).data("template");
      const data = csrfPaylaod({ template });

      $.ajax(Craft.getCpUrl("freeform/api/templates/demo"), {
        type: "post",
        dataType: "json",
        data,
        complete: (jqXHR) => {
          if (jqXHR.status === 201) {
            window.location.reload();
          }
        },
      });
    },
  });
};
