import { afterEach, describe, expect, it } from "vitest";
import {
  loadTemplateStorageScript,
  loadTemplatesModeScript,
} from "./templates.mode";

const mount = (selected = "form", disabled = false) => {
  document.body.innerHTML = `<form><div id="template-method-field">
    ${["form", "global", "all"].map((value) => `<input type="radio" name="settings[emailTemplateMethod]" value="${value}" ${selected === value ? "checked" : ""} ${disabled ? "disabled" : ""}>`).join("")}
    </div><div id="global-email-block"><input name="settings[emailTemplateDirectory]" value="_emails"></div></form>`;
  loadTemplatesModeScript();
  return document.querySelector("#global-email-block")!;
};

afterEach(() => {
  document.body.innerHTML = "";
});

describe("template method cards", () => {
  it.each(["form", "global", "all"])(
    "initializes visibility and preserves the %s submission value",
    (method) => {
      const block = mount(method);
      expect(block.classList.contains("hidden")).toBe(method === "form");
      expect(
        new FormData(document.querySelector("form")!).get(
          "settings[emailTemplateMethod]",
        ),
      ).toBe(method);
    },
  );

  it("shows shared settings for global and combined methods without clearing their values", () => {
    const block = mount();
    for (const method of ["global", "all", "form"]) {
      const input = document.querySelector<HTMLInputElement>(
        `input[value="${method}"]`,
      )!;
      input.checked = true;
      input.dispatchEvent(new Event("change", { bubbles: true }));
      expect(block.classList.contains("hidden")).toBe(method === "form");
      expect(
        new FormData(document.querySelector("form")!).get(
          "settings[emailTemplateDirectory]",
        ),
      ).toBe("_emails");
    }
  });

  it("preserves the read-only selection and does not submit disabled controls", () => {
    const block = mount("global", true);
    expect(block.classList.contains("hidden")).toBe(false);
    expect(
      document.querySelectorAll("input[type=radio]:disabled"),
    ).toHaveLength(3);
    expect(
      new FormData(document.querySelector("form")!).get(
        "settings[emailTemplateMethod]",
      ),
    ).toBeNull();
  });

  it("does nothing on other settings pages", () => {
    expect(() => loadTemplatesModeScript()).not.toThrow();
  });
});

describe("template storage cards", () => {
  const mountStorage = (selected: string, disabled = false) => {
    document.body.innerHTML = `<form><div id="storage-type-field">
      ${["files", "database", "files_database"].map((value) => `<input type="radio" name="settings[emailTemplateStorageType]" value="${value}" ${selected === value ? "checked" : ""} ${disabled ? "disabled" : ""}>`).join("")}
      </div><div id="files-directory"><input name="directory" value="_emails"></div><div id="template-default" class="builder-templates"></div></form>`;
    loadTemplateStorageScript();
  };
  it.each(["files", "database", "files_database"])(
    "shows the appropriate settings for %s and preserves its submitted value",
    (storage) => {
      mountStorage(storage);
      expect(
        document
          .querySelector("#files-directory")!
          .classList.contains("hidden"),
      ).toBe(storage === "database");
      expect(
        document
          .querySelector("#template-default")!
          .classList.contains("hidden"),
      ).toBe(storage !== "files_database");
      expect(
        new FormData(document.querySelector("form")!).get(
          "settings[emailTemplateStorageType]",
        ),
      ).toBe(storage);
    },
  );
  it("retains the file directory when switching storage choices", () => {
    mountStorage("files");
    for (const storage of ["database", "files_database", "files"]) {
      const radio = document.querySelector<HTMLInputElement>(
        `input[value="${storage}"]`,
      )!;
      radio.checked = true;
      radio.dispatchEvent(new Event("change", { bubbles: true }));
      expect(
        document
          .querySelector("#files-directory")!
          .classList.contains("hidden"),
      ).toBe(storage === "database");
      expect(
        new FormData(document.querySelector("form")!).get("directory"),
      ).toBe("_emails");
    }
  });
  it("preserves disabled selections without submitting them", () => {
    mountStorage("database", true);
    expect(
      document.querySelectorAll("input[type=radio]:disabled"),
    ).toHaveLength(3);
    expect(
      new FormData(document.querySelector("form")!).get(
        "settings[emailTemplateStorageType]",
      ),
    ).toBeNull();
  });
  it("does nothing outside Template Manager", () => {
    expect(() => loadTemplateStorageScript()).not.toThrow();
  });
});
