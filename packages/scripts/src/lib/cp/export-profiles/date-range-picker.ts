export function attachDateRangePicker(
  input: HTMLInputElement,
  label: string,
): void {
  const container = input.parentElement;
  if (!container || container.querySelector(".ff-export-date-picker")) return;

  container.classList.add("ff-export-date-control");
  const picker = document.createElement("input");
  picker.type = "date";
  picker.className = "ff-export-date-picker";
  picker.setAttribute("aria-label", label);
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("aria-hidden", "true");
  icon.classList.add("ff-export-date-icon");
  icon.innerHTML =
    '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>';
  container.append(icon, picker);

  const sync = (): void => {
    picker.value = /^\d{4}-\d{2}-\d{2}$/.test(input.value) ? input.value : "";
  };
  sync();
  input.addEventListener("input", sync);
  input.addEventListener("change", sync);
  picker.addEventListener("click", () => {
    sync();
    try {
      picker.showPicker?.();
    } catch {
      // Native date entry remains available if opening the popup is unsupported.
    }
  });
  picker.addEventListener("change", () => {
    input.value = picker.value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
}
