import { expect, it } from "vitest";

it("normalizes classic form submissions and attaches once after AJAX replacement", async () => {
  document.body.innerHTML = `<form><input name="phone" type="tel" data-freeform-phone='{"international":true,"defaultCountry":"GB","allowedCountries":["GB","US"]}' value="020 7946 0018"><button type="submit">Submit</button></form>`;
  await import("./phone");
  document.dispatchEvent(new Event("DOMContentLoaded"));
  await Promise.resolve();
  const form = document.querySelector("form")!;
  const input = form.querySelector("input")!;
  form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  expect(input.value).toBe("+442079460018");
  const data = new FormData(form);
  input.value = "020 7946 0018";
  const event = new Event("formdata");
  Object.defineProperty(event, "formData", { value: data });
  form.dispatchEvent(event);
  expect(data.get("phone")).toBe("+442079460018");
  form.innerHTML = `<input name="phone" data-freeform-phone='{"international":true,"defaultCountry":"US","allowedCountries":["US"]}'>`;
  await Promise.resolve();
  await Promise.resolve();
  expect(form.querySelectorAll(".freeform-phone-country")).toHaveLength(1);
  document.body.innerHTML = "";
  await Promise.resolve();
  await Promise.resolve();
});
