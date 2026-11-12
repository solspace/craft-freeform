import { whenCpReady } from "@lib/cp/ready";
import {
  mountSignaturePreviews,
  signatureDownloadFilename,
} from "@lib/cp/signature-preview";
import { mountSubmissionDownload } from "@lib/cp/submission-download";
import { mountSubmissionUploads } from "@lib/cp/submission-uploads";

const bindDeleteAction = () => {
  $("#freeform-delete-submission").on("click", (event) => {
    event.preventDefault();
    if (!confirm(Craft.t("freeform", "Are you sure you want to delete this?")))
      return;
    Craft.sendActionRequest("POST", "freeform/submissions/delete", {
      data: { id: $('[data-freeform] input[name="submissionId"]').val() },
    })
      .then((response) => {
        if (response.data.success)
          window.location.href = Craft.getCpUrl("freeform/submissions");
        else Craft.cp.displayError(response.data.message);
      })
      .catch(() =>
        Craft.cp.displayError(
          Craft.t("freeform", "Submission could not be deleted."),
        ),
      );
  });
};

whenCpReady(() => {
  const fields = document.querySelector("[data-freeform-submission]");
  const form = fields?.closest("form");
  if (form) {
    form.enctype = "multipart/form-data";
    form.dataset.freeform = "";
    form.dataset.id = fields.dataset.formAnchor;
    form.dataset.signatureFilename = fields.dataset.signatureFilename;
  }
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

  mountSubmissionDownload();
  const $assetDownloadForm = $("form#asset_download");
  $("#content").on(
    {
      click: function (event) {
        event.preventDefault();
        const { assetId } = $(this).data();

        $("input[name=assetId]", $assetDownloadForm).val(assetId);
        $assetDownloadForm.submit();
      },
    },
    "a[data-asset-id]",
  );

  mountSubmissionUploads(document.body);
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

  bindDeleteAction();
}, "[data-freeform-submission]");
