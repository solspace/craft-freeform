let pending = false;

export async function exportSubmissions(ids) {
  if (pending) {
    return;
  }

  pending = true;
  try {
    const response = await Craft.sendActionRequest(
      "POST",
      "freeform/submissions/validate-export",
      { data: { submissionIds: ids.join(",") } },
    );

    if (!response.data.success) {
      Craft.cp.displayError(response.data.message);
      return;
    }

    const form = document.createElement("form");
    form.method = "post";
    form.target = "_blank";

    for (const [name, value] of Object.entries({
      action: "freeform/submissions/export",
      submissionIds: ids.join(","),
      [Craft.csrfTokenName]: Craft.csrfTokenValue,
    })) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.append(input);
    }

    document.body.append(form);
    try {
      form.submit();
    } finally {
      form.remove();
    }
  } catch {
    Craft.cp.displayError(
      Craft.t("freeform", "Could not export submissions. Please try again."),
    );
  } finally {
    pending = false;
  }
}

window.freeform_export_csv = exportSubmissions;
