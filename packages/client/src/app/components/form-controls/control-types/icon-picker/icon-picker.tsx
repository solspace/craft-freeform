import { Control } from "@components/form-controls/control";
import type { ControlType } from "@components/form-controls/types";
import config from "@config/freeform/freeform.config";
import type { IconProperty } from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";
import { useId, useLayoutEffect, useRef } from "react";

type LegacyPicker = {
  on: (
    event: string,
    callback: (event: { iconName: string | null }) => void,
  ) => void;
  selectIcon: (value: string) => Promise<void>;
  destroy: () => void;
  modal?: { destroy: () => void };
  cancelToken?: { cancel: () => void };
};
type PickerManager = {
  value: string;
  render: (value: string) => void;
  destroy: () => void;
};

export const CraftIconPicker = ({
  value: storedValue,
  disabled,
  onChange,
  label = translate("Form Icon"),
}: {
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  label?: string;
}) => {
  const value = /^[a-z0-9-]{1,100}$/.test(storedValue) ? storedValue : "";
  const labelId = useId();
  const host = useRef<HTMLDivElement>(null);
  const manager = useRef<PickerManager>(null);
  const current = useRef({ value, onChange });
  current.current = { value, onChange };
  const native = config.metadata.craft.is.atLeast("6.0.0");

  useLayoutEffect(() => {
    const container = host.current;
    if (!container) return;
    let cleanup = () => {};
    const api: PickerManager = {
      value: current.current.value,
      destroy: () => cleanup(),
      render: (next) => {
        cleanup();
        api.value = next;
        let active = true;
        const change = (selected: string | null) => {
          if (!active) return;
          api.value = selected || "";
          if (!disabled && api.value !== current.current.value)
            current.current.onChange(api.value);
        };
        if (native) {
          const element = document.createElement("craft-icon-picker");
          element.setAttribute("value", next);
          const labelElement = document.createElement("span");
          labelElement.id = labelId;
          labelElement.textContent = label;
          Object.assign(labelElement.style, {
            position: "absolute",
            width: "1px",
            height: "1px",
            overflow: "hidden",
            clipPath: "inset(50%)",
          });
          element.setAttribute("labelled-by", labelId);
          if (disabled) element.setAttribute("disabled", "");
          const changed = (event: Event) => {
            const detail = (event as CustomEvent<{ value?: string }>).detail;
            if (event.target === element && typeof detail?.value === "string")
              change(detail.value);
          };
          element.addEventListener("change", changed);
          container.replaceChildren(labelElement, element);
          cleanup = () => {
            active = false;
            element.removeEventListener("change", changed);
            element.remove();
            labelElement.remove();
          };
          return;
        }

        const element = document.createElement("div");
        element.className = "icon-picker";
        const preview = document.createElement("div");
        preview.className = "icon-picker--icon";
        const button = (className: string, label: string) => {
          const item = document.createElement("button");
          item.type = "button";
          item.className = `btn ${className}`;
          item.disabled = !!disabled;
          const text = document.createElement("span");
          text.className = "label";
          text.textContent = translate(label);
          item.append(text);
          return item;
        };
        const choose = button(
          "icon-picker--choose-btn",
          next ? "Change" : "Choose",
        );
        const remove = button(
          `icon-picker--remove-btn${next ? "" : " hidden"}`,
          "Remove",
        );
        const input = document.createElement("input");
        input.type = "hidden";
        input.value = next;
        element.append(preview, choose, remove, input);
        container.replaceChildren(element);
        const Constructor = (
          Craft as unknown as {
            IconPicker: new (container: HTMLElement) => LegacyPicker;
          }
        ).IconPicker;
        const picker = new Constructor(element);
        picker.on("change", ({ iconName }) => change(iconName));
        if (next) void picker.selectIcon(next).catch(() => {});
        cleanup = () => {
          active = false;
          picker.cancelToken?.cancel();
          picker.modal?.destroy();
          picker.destroy();
          element.remove();
        };
      },
    };
    manager.current = api;
    api.render(current.current.value);
    return () => {
      api.destroy();
      manager.current = null;
    };
  }, [native, disabled, labelId, label]);

  useLayoutEffect(() => {
    // A selection is already displayed by Craft; only rebuild for external
    // changes such as undo/redo. Craft 6 reads its value attribute on mount.
    if (manager.current && manager.current.value !== value)
      manager.current.render(value);
  }, [value]);

  return <div ref={host} />;
};

const IconPicker: React.FC<ControlType<IconProperty>> = ({
  value,
  property,
  errors,
  updateValue,
  context,
}) => {
  if (!config.metadata.craft.is5) return null;
  return (
    <Control property={property} errors={errors} context={context}>
      <CraftIconPicker
        label={translate(property.label || "Icon")}
        value={value || ""}
        disabled={property.disabled}
        onChange={updateValue}
      />
    </Control>
  );
};

export default IconPicker;
