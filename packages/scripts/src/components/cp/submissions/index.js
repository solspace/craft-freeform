import {
  mountSignaturePreviews,
  signatureDownloadFilename,
} from "@lib/cp/signature-preview";

const updateActionButtons = () => {
  const $actionButtonsContainer = $("#action-buttons");

  if (!$actionButtonsContainer.length) {
    return;
  }

  const $actionsMenuId = `actions-menu-${Craft.randomString(10)}`;

  const $actionsMenuBtn = $("<button/>", {
    role: "button",
    type: "button",
    class: "btn menubtn action-btn hairline-dark btngroup-btn-last m",
    title: Craft.t("app", "Actions"),
    "aria-label": Craft.t("app", "Actions"),
    "data-disclosure-trigger": true,
    "aria-controls": $actionsMenuId,
  }).appendTo($actionButtonsContainer);

  const $actionsMenu = $("<div/>", {
    id: $actionsMenuId,
    class: "menu menu--disclosure",
  }).appendTo($actionButtonsContainer);

  const $actionsMenuUl = $("<ul/>").appendTo($actionsMenu);

  const $actionsMenuLi = $("<li/>").appendTo($actionsMenuUl);

  $("<button/>", {
    tabIndex: 0,
    role: "button",
    type: "button",
    class: "menu-item error",
    title: Craft.t("app", "Delete"),
    "aria-label": Craft.t("app", "Delete"),
    html: '<span class="icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" focusable="false" aria-hidden="true"><!--! Font Awesome Pro 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2024 Fonticons, Inc. --><path d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z"></path></svg></span><span class="menu-item-label inline-flex flex-col items-start gap-2xs">Delete</span>',
  })
    .appendTo($actionsMenuLi)
    .on("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (
        !confirm(
          Craft.t(
            "freeform",
            "Are you sure you want to delete the submission?",
          ),
        )
      ) {
        $actionsMenuBtn.data("trigger").hide();

        return false;
      }

      Craft.sendActionRequest("POST", "freeform/submissions/delete", {
        data: {
          [Craft.csrfTokenName]: Craft.csrfTokenValue,
          id: $('[data-freeform] input[name="submissionId"]').val(),
        },
      }).then((response) => {
        if (response.data.success) {
          window.location.href = Craft.getCpUrl("freeform/submissions");
        } else {
          Craft.cp.displayError(response.data.message);

          $actionsMenuBtn.data("trigger").hide();
        }
      });
    });

  $actionsMenuBtn.disclosureMenu();
};

$(() => {
  const $statusSelect = $("#status-menu-btn");
  const menu = $statusSelect.data("menubtn");

  if (menu) {
    menu.setSettings({
      onOptionSelect: (data) => {
        const id = $(data).data("id");
        const name = $(data).data("name");
        const color = $(data).data("color");
        const $status = $("#status-menu-select");

        $("#statusId").val(id);
        const html =
          "<span class='status " +
          color +
          "'></span>" +
          Craft.uppercaseFirst(name);
        $statusSelect.html(html);

        $status.find("li a.sel").removeClass("sel");
        $status.find(`li a[data-id=${id}]`).addClass("sel");
      },
    });
  }

  const $assetDownloadForm = $("form#asset_download");
  $("#content").on(
    {
      click: function () {
        const { assetId } = $(this).data();

        $("input[name=assetId]", $assetDownloadForm).val(assetId);
        $assetDownloadForm.submit();
      },
    },
    "a[data-asset-id]",
  );

  mountSignaturePreviews(document.body);

  // Keep custom CP field templates using the former canvas/link hooks working.
  $("canvas[data-image]").each(function () {
    const source = this.dataset.image || "";
    if (!/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/]+={0,2}$/.test(source))
      return;
    const image = new Image();
    image.onload = () => this.getContext("2d")?.drawImage(image, 0, 0);
    image.src = source;
  });
  $(".download-signature-links a[data-type]").on("click", function (event) {
    event.preventDefault();
    const canvas = $(this).closest(".signature-wrapper").find("canvas")[0];
    if (!canvas) return;
    const jpeg = $(this).data("type") === "jpg";
    const output = document.createElement("canvas");
    output.width = canvas.width;
    output.height = canvas.height;
    const context = output.getContext("2d");
    if (!context) return;
    if (jpeg) {
      context.fillStyle = "#fff";
      context.fillRect(0, 0, output.width, output.height);
    }
    context.drawImage(canvas, 0, 0);
    const link = document.createElement("a");
    link.download = signatureDownloadFilename(this, jpeg ? "jpg" : "png");
    link.href = output.toDataURL(jpeg ? "image/jpeg" : "image/png");
    link.click();
  });

  $("#export-btn").remove();

  $("#delete-button").on("click", function () {
    if (
      !confirm(Craft.t("freeform", "Are you sure you want to delete this?"))
    ) {
      return;
    }

    $(this).attr("disabled", true).addClass("disabled").text("Deleting");

    const id = $(this).data("id");
    $.ajax({
      type: "post",
      url: Craft.getCpUrl("freeform/spam/delete"),
      dataType: "json",
      data: {
        id,
        [Craft.csrfTokenName]: Craft.csrfTokenValue,
      },
      success: (response) => {
        if (response.success) {
          window.location.href = Craft.getCpUrl("freeform/spam");
        } else {
          console.error("Could not delete spam submission");
        }
      },
    });
  });

  $("#block-ip-address-button").on("click", function () {
    const $button = $(this);

    const id = $button.data("id");
    if (!id) {
      Craft.cp.displayError(Craft.t("freeform", "Submission ID was missing."));
      return;
    }

    const ip = $button.data("ip");
    if (!ip) {
      Craft.cp.displayError(Craft.t("freeform", "IP Address was missing."));
      return;
    }

    if (!confirm(Craft.t("freeform", `Block IP Address ${ip}?`))) {
      return;
    }

    $button.attr("disabled", true).addClass("disabled");

    Craft.sendActionRequest(
      "POST",
      "freeform/spam-submissions/block-ip-address",
      {
        data: {
          id,
          ip,
        },
      },
    )
      .then((response) => {
        if (response.data.success) {
          Craft.cp.displaySuccess(response.data.message);

          $button.closest(".btngroup").fadeOut(200, function () {
            $(this).remove();
          });
        } else {
          Craft.cp.displayError(response.data.message);

          $button.removeAttr("disabled").removeClass("disabled");
        }
      })
      .catch(() => {
        Craft.cp.displayError(
          Craft.t("freeform", "Could not block IP Address."),
        );

        $button.removeAttr("disabled").removeClass("disabled");
      });
  });

  if (window.isCraft5) {
    updateActionButtons();
  }
});
