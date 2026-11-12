/** Mount the download form outside Craft's native submission-edit form. */
export function mountSubmissionDownload(root: ParentNode = document): void {
  const template = root.querySelector<HTMLTemplateElement>(
    "#freeform-submission-download",
  );
  if (!template || document.getElementById("asset_download")) return;
  const form = template.content.querySelector("form");
  if (form) document.body.append(form.cloneNode(true));
}
