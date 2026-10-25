import { csrfPaylaod } from "../../../utilities/ajax";

export const loadFormattingTemplatesScript = () => {
  // @ts-expect-error
  new Garnish.MenuBtn($("#add-formatting-template"), {
    onOptionSelect: (option: HTMLElement) => {
      const template = $(option).data("template");
      const sampleName = $(option).text().trim();
      const content = $(
        '<div class="modal fitted ff-clone-template-modal">',
      ).appendTo("body");
      const header = $('<div class="header"><h2></h2></div>').appendTo(content);
      header.find("h2").text(Craft.t("freeform", "Clone a Sample Template"));
      const body = $(
        '<div class="body" style="padding: 24px; min-width: 360px;"></div>',
      ).appendTo(content);
      $('<p style="margin: 0 0 18px;"></p>')
        .text(`${Craft.t("freeform", "Sample")}: ${sampleName}`)
        .appendTo(body);
      const field = $(
        '<div class="field"><div class="heading"><label for="ff-clone-template-name"></label></div><div class="input"><input class="text fullwidth" id="ff-clone-template-name" maxlength="80"></div></div>',
      ).appendTo(body);
      field.find("label").text(Craft.t("freeform", "New template name"));
      const input = field.find("input").val(`${sampleName} Copy`);
      const error = $('<p class="error hidden" role="alert"></p>').appendTo(
        body,
      );
      const footer = $(
        '<div class="footer" style="display:flex; justify-content:flex-end; gap:8px;"></div>',
      ).appendTo(content);
      const cancel = $('<button type="button" class="btn"></button>')
        .text(Craft.t("freeform", "Cancel"))
        .appendTo(footer);
      const submit = $('<button type="button" class="btn submit"></button>')
        .text(Craft.t("freeform", "Clone Template"))
        .appendTo(footer);
      // @ts-expect-error
      const modal = new Garnish.Modal(content, {
        onShow: () => input.trigger("focus").trigger("select"),
        onHide: () => content.remove(),
      });
      cancel.on("click", () => modal.hide());
      const clone = () => {
        const name = String(input.val() ?? "").trim();
        if (!/^[a-zA-Z0-9][a-zA-Z0-9 _-]{0,79}$/.test(name)) {
          error
            .text(
              Craft.t(
                "freeform",
                "Use letters, numbers, spaces, hyphens, or underscores.",
              ),
            )
            .removeClass("hidden");
          input.trigger("focus");
          return;
        }
        error.addClass("hidden");
        submit.prop("disabled", true).addClass("disabled");
        $.ajax(Craft.getCpUrl("freeform/api/templates/demo"), {
          type: "post",
          dataType: "json",
          data: csrfPaylaod({ template, name }),
        })
          .done(() => window.location.reload())
          .fail((response) => {
            error
              .text(
                response.responseJSON?.message ??
                  Craft.t("freeform", "Could not clone the sample template."),
              )
              .removeClass("hidden");
          })
          .always(() => submit.prop("disabled", false).removeClass("disabled"));
      };
      submit.on("click", clone);
      input.on("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          clone();
        }
      });
    },
  });
};
