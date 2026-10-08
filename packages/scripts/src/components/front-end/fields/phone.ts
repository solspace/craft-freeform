import {
  type InternationalPhoneConfig,
  mountInternationalPhone,
} from "../../../../../frontend/core/src/phone/international-phone";

const controls = new Map<
  HTMLInputElement,
  ReturnType<typeof mountInternationalPhone>
>();
const forms = new WeakSet<HTMLFormElement>();
function attach() {
  for (const [input, control] of controls) {
    if (!input.isConnected) {
      control.destroy();
      controls.delete(input);
    }
  }
  document
    .querySelectorAll<HTMLInputElement>("input[data-freeform-phone]")
    .forEach((input) => {
      if (controls.has(input)) return;
      let config: InternationalPhoneConfig;
      try {
        config = JSON.parse(input.dataset.freeformPhone ?? "{}");
      } catch {
        return;
      }
      if (!config.international) return;
      controls.set(input, mountInternationalPhone(input, config));
      const form = input.form;
      if (!form || forms.has(form)) return;
      forms.add(form);
      form.addEventListener(
        "submit",
        () => {
          for (const [field, control] of controls) {
            if (field.form === form && !field.matches(":disabled"))
              field.value = control.getValue();
          }
        },
        true,
      );
      // Also supports FormData-based AJAX and custom submitters.
      form.addEventListener("formdata", (event) => {
        for (const [field, control] of controls) {
          if (
            field.form === form &&
            field.name &&
            !field.matches(":disabled") &&
            event.formData.has(field.name)
          )
            event.formData.set(field.name, control.getValue());
        }
      });
    });
}
if (document.readyState === "loading")
  document.addEventListener("DOMContentLoaded", attach, { once: true });
else attach();
new MutationObserver(attach).observe(document.documentElement, {
  childList: true,
  subtree: true,
});
