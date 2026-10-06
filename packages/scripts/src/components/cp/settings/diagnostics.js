(() => {
  const root = document.getElementById("freeform-diagnostics");
  const button = document.getElementById("freeform-copy-diagnostics");
  const report = document.getElementById("freeform-diagnostic-report");
  const status = document.getElementById("freeform-diagnostic-copy-status");
  const disclosure = root?.querySelector(".ff-diag-report");
  if (!root || !button || !report || !status || !disclosure) return;

  const copyLabel = button.textContent;
  let resetCopyLabel;
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(report.value);
      clearTimeout(resetCopyLabel);
      button.textContent = button.dataset.copiedLabel;
      status.textContent = root.dataset.copySuccess;
      resetCopyLabel = setTimeout(() => {
        button.textContent = copyLabel;
      }, 3000);
    } catch {
      clearTimeout(resetCopyLabel);
      button.textContent = copyLabel;
      disclosure.open = true;
      report.focus();
      report.select();
      status.textContent = root.dataset.copyFallback;
    }
  });
})();
