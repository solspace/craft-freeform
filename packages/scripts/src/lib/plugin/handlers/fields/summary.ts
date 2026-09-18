import type Freeform from "@components/front-end/plugin/freeform";
import type { FreeformHandler } from "types/form";
import {
  formatSummaryValue,
  type SummaryConfig,
  type SummarySource,
} from "../../../../../../frontend/core/src/summary/summary";
import events from "../../constants/event-types";

type Source = SummarySource & {
  visible: boolean;
  text: string;
  fileCounts?: Record<number, Record<number, number>>;
};
type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export default class SummaryHandler implements FreeformHandler {
  constructor(private freeform: Freeform) {
    const form = freeform.form;
    // Defer until other field/rule handlers have settled, including calculations.
    const update = () => queueMicrotask(this.reload);
    form.addEventListener("input", update, true);
    form.addEventListener("change", update, true);
    form.addEventListener("keyup", update);
    form.addEventListener(events.rules.applied, update, true);
    form.addEventListener(events.dragAndDrop.onChange, update, true);
    form.addEventListener(events.table.afterRowAdded, update);
    form.addEventListener(events.table.afterRemoveRow, update);
    form.addEventListener("reset", () => setTimeout(this.reload, 0));
    this.reload();
  }

  reload = () => {
    const form = this.freeform.form;
    form
      .querySelectorAll<HTMLElement>("[data-freeform-summary]")
      .forEach((summary) => {
        const config: SummaryConfig = JSON.parse(
          summary.dataset.summaryConfig || "{}",
        );
        const sources: Source[] = JSON.parse(
          summary.dataset.summarySources || "[]",
        );
        const fragment = document.createDocumentFragment();
        const containers = Array.from(
          form.querySelectorAll<HTMLElement>("[data-field-container]"),
        );
        const controls = Array.from(form.elements).filter(
          (element): element is Control =>
            element instanceof HTMLInputElement ||
            element instanceof HTMLSelectElement ||
            element instanceof HTMLTextAreaElement,
        );

        for (const source of sources) {
          const container = containers.find(
            (element) => element.dataset.fieldContainer === source.handle,
          );
          if (container ? container.closest("[data-hidden]") : !source.visible)
            continue;
          const inputs = controls.filter(
            (input) =>
              input.name === source.handle ||
              input.name.startsWith(`${source.handle}[`),
          );
          let text = source.text;
          if (inputs.length || container) {
            let value: unknown;
            if (source.type === "table") {
              const rows: unknown[][] = [];
              for (const input of inputs) {
                const indexes = input.name
                  .slice(source.handle.length)
                  .match(/^\[(\d+)\]\[(\d+)\]/);
                if (!indexes) continue;
                const [, row, column] = indexes;
                rows[Number(row)] ??= [];
                let cell = this.readControls(
                  inputs.filter((item) => item.name === input.name),
                  source.columns?.[Number(column)]?.type ?? "text",
                );
                if (
                  source.columns?.[Number(column)]?.type === "file" &&
                  Array.isArray(cell) &&
                  cell.length === 0
                ) {
                  cell = Array(
                    source.fileCounts?.[Number(row)]?.[Number(column)] ?? 0,
                  ).fill(true);
                }
                rows[Number(row)][Number(column)] = cell;
              }
              value = rows;
            } else {
              value = this.readControls(inputs, source.type);
            }
            // Native uploads retain existing assets when no replacement is selected.
            if (
              !(
                source.type === "file" &&
                Array.isArray(value) &&
                value.length === 0
              )
            ) {
              text = formatSummaryValue(source, value, config);
            }
          }
          if (config.hideEmpty !== false && text === "") continue;
          const item = document.createElement("div");
          item.dataset.summaryField = source.handle;
          const term = document.createElement("dt");
          term.textContent = source.label;
          const description = document.createElement("dd");
          description.style.whiteSpace = "pre-wrap";
          description.textContent = text === "" ? config.emptyValue : text;
          item.append(term, description);
          fragment.append(item);
        }
        summary.replaceChildren(fragment);
      });
  };

  private readControls(inputs: Control[], type: string): unknown {
    if (type === "checkbox") {
      return inputs.some(
        (input) =>
          input instanceof HTMLInputElement &&
          input.type === "checkbox" &&
          input.checked,
      );
    }
    const values: unknown[] = [];
    for (const input of inputs) {
      if (input instanceof HTMLInputElement) {
        if (
          (input.type === "checkbox" || input.type === "radio") &&
          !input.checked
        )
          continue;
        if (input.type === "file") {
          values.push(...Array.from(input.files ?? []));
          continue;
        }
      }
      if (input instanceof HTMLSelectElement && input.multiple) {
        values.push(
          ...Array.from(input.selectedOptions).map((option) => option.value),
        );
      } else if (input.value !== "") {
        values.push(input.value);
      }
    }
    return values;
  }
}
