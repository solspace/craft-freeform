export function attachProfileFormats(container: HTMLElement): void {
  const profile = document.querySelector<HTMLSelectElement>("#profileId");
  const fileType = container.querySelector<HTMLSelectElement>("#fileType");
  if (!profile || !fileType) return;

  const formats: Record<string, Record<string, string>> = JSON.parse(
    container.dataset.exportProfileFormats || "{}",
  );
  const update = () => {
    const selected = fileType.value;
    const options = formats[profile.value] || {};
    fileType.options.length = 0;
    fileType.add(
      new Option(container.dataset.exportFormatPlaceholder || "", ""),
    );
    for (const [value, label] of Object.entries(options)) {
      fileType.add(new Option(label, value));
    }
    fileType.value = Object.hasOwn(options, selected) ? selected : "";
  };
  profile.addEventListener("change", update);
  update();
}
