export function initDigestSchedules(root: ParentNode = document): void {
  root
    .querySelectorAll<HTMLElement>("[data-digest-schedule]")
    .forEach((holder) => {
      if (holder.dataset.digestReady) return;
      const select = holder.querySelector<HTMLSelectElement>("select");
      const controls = holder.querySelector<HTMLElement>(
        "[data-digest-controls]",
      );
      const legacy = holder.querySelector<HTMLElement>("[data-digest-legacy]");
      const weekly = holder.querySelector<HTMLElement>("[data-digest-weekly]");
      const summary = holder.querySelector<HTMLElement>(
        "[data-digest-summary]",
      );
      if (
        !select ||
        !controls ||
        !legacy ||
        !weekly ||
        !summary ||
        !/^(?:-1|[0-6])$/.test(select.value)
      )
        return;
      holder.dataset.digestReady = "true";
      const modes =
        holder.querySelectorAll<HTMLButtonElement>("[data-digest-mode]");
      const days =
        holder.querySelectorAll<HTMLButtonElement>("[data-digest-day]");
      let weeklyDay = select.value === "-1" ? "1" : select.value;
      const update = () => {
        const daily = select.value === "-1";
        if (!daily) weeklyDay = select.value;
        weekly.hidden = daily;
        modes.forEach((button) => {
          const selected =
            button.dataset.digestMode === (daily ? "daily" : "weekly");
          button.setAttribute("aria-pressed", String(selected));
          if (button.localName === "craft-button")
            button.toggleAttribute("active", selected);
          button.disabled = select.disabled;
        });
        days.forEach((button) => {
          const selected = button.dataset.digestDay === weeklyDay;
          button.setAttribute("aria-pressed", String(selected));
          if (button.localName === "craft-button")
            button.toggleAttribute("active", selected);
          button.disabled = select.disabled;
        });
        const dayName =
          Array.from(days).find(
            (button) => button.dataset.digestDay === weeklyDay,
          )?.dataset.dayName || "";
        summary.textContent = daily
          ? holder.dataset.summaryDaily || ""
          : (holder.dataset.summaryWeekly || "").replace("{day}", dayName);
      };
      const choose = (value: string) => {
        if (select.disabled) return;
        select.value = value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
      };
      modes.forEach((button) => {
        button.addEventListener("click", () =>
          choose(button.dataset.digestMode === "daily" ? "-1" : weeklyDay),
        );
      });
      days.forEach((button) => {
        button.addEventListener("click", () =>
          choose(button.dataset.digestDay!),
        );
      });
      select.addEventListener("change", update);
      legacy.hidden = true;
      controls.hidden = false;
      update();
    });
}
