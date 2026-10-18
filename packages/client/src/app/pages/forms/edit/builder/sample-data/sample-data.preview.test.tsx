import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Field } from "@editor/store/slices/layout/fields";
import type { FieldType } from "@ff-client/types/fields";
import {
  type OptionCollection,
  PropertyType,
} from "@ff-client/types/properties";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import DOMPurify from "dompurify";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { useFieldPreview } from "../tabs/layout/field-layout/field/cell/use-field-preview";
import { SampleDataProvider, useSampleData } from "./sample-data.context";

it("keeps multiple file samples stable while editing and respects a reduced upload limit", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const random = vi.spyOn(Math, "random").mockReturnValue(0.999);
  let field = {
    uid: "files",
    properties: {
      sampleData: true,
      fileKinds: ["image"],
      fileCount: 10,
      theme: "light",
      accent: "#009688",
      showUploadRequirements: false,
    },
  } as Field;
  const type = {
    type: "file-dnd",
    properties: [],
    previewTemplate: readFileSync(
      resolve(
        import.meta.dirname,
        "../../../../../../../../plugin/src/Fields/Implementations/PreviewTemplates/file-drag-n-drop.ejs",
      ),
      "utf8",
    ),
  } as FieldType;
  const client = new QueryClient();
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const Preview = () => {
    const [html] = useFieldPreview(field, type);
    return (
      <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
    );
  };
  const view = () => (
    <QueryClientProvider client={client}>
      <SampleDataProvider>
        <Preview />
      </SampleDataProvider>
    </QueryClientProvider>
  );
  try {
    await act(async () => root.render(view()));
    expect(host.querySelectorAll("img")).toHaveLength(3);
    random.mockReturnValue(0);
    field = {
      ...field,
      properties: { ...field.properties, label: "Edited label" },
    };
    await act(async () => root.render(view()));
    expect(host.querySelectorAll("img")).toHaveLength(3);
    field = { ...field, properties: { ...field.properties, fileCount: 1 } };
    await act(async () => root.render(view()));
    expect(host.querySelectorAll("img")).toHaveLength(1);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    client.clear();
    random.mockRestore();
    vi.unstubAllGlobals();
  }
});

const fixture = vi.hoisted(() => ({ options: [] as OptionCollection }));
vi.mock("axios", () => ({ default: { get: vi.fn() } }));

vi.mock("@components/options/use-field-options", () => ({
  useFieldOptions: () => [fixture.options, false],
}));
vi.mock("@editor/store/slices/translations/translations.hooks", () => ({
  useTranslations: () => ({
    getTranslation: (_key: string, value: unknown) => value,
  }),
}));
vi.mock("@ff-client/queries/assets", () => ({ useAssetQuery: () => ({}) }));
vi.mock("@ff-client/contexts/site/site.context", () => ({
  useSiteContext: () => ({ current: { id: 1 } }),
}));

it.each(["text", "textarea"])(
  "renders a sample as %s content without changing the expression or treating quotes as markup",
  async (templateName) => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const expression = "Before {{ faker.company|raw }}123 after";
    const sample = 'O’Neil "Blue" & Sons <img src=x onerror=alert(1)>';
    const field = {
      uid: "one",
      typeClass: "Text",
      properties: {
        defaultValue: expression,
        placeholder: "",
        rows: 3,
        sampleData: true,
      },
    } as Field;
    const source = readFileSync(
      resolve(
        import.meta.dirname,
        "../../../../../../../../plugin/src/Fields/Implementations/PreviewTemplates",
        `${templateName}.ejs`,
      ),
      "utf8",
    );
    const type = {
      type: templateName,
      properties: [
        {
          handle: "defaultValue",
          translatable: true,
          type: PropertyType.String,
        },
      ],
      previewTemplate: source,
    } as FieldType;
    const client = new QueryClient();
    client.setQueryData(
      ["sample-data", 1],
      [{ id: "company", label: "Company name", value: sample }],
    );
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    const Preview = () => {
      const [html] = useFieldPreview(field, type);
      return (
        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
      );
    };
    try {
      await act(async () =>
        root.render(
          <QueryClientProvider client={client}>
            <SampleDataProvider>
              <Preview />
            </SampleDataProvider>
          </QueryClientProvider>,
        ),
      );
      expect(
        host.querySelector<HTMLInputElement | HTMLTextAreaElement>(
          "input, textarea",
        )?.value,
      ).toBe(`Before ${sample}123 after`);
      expect(host.querySelector("img")).toBeNull();
      expect(field.properties.defaultValue).toBe(expression);
    } finally {
      await act(async () => root.unmount());
      host.remove();
      client.clear();
      vi.unstubAllGlobals();
    }
  },
);

it.each(["dropdown", "radios", "checkboxes", "multiple-select"])(
  "previews random %s selections without changing defaults or fetching Faker, and restores defaults when disabled",
  async (templateName) => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const multiple =
      templateName === "checkboxes" || templateName === "multiple-select";
    fixture.options = ["a", "b", "c", "d"].map((value) => ({
      value,
      label: value.toUpperCase(),
    }));
    if (templateName === "dropdown" || templateName === "multiple-select")
      fixture.options = [
        { label: "Choose...", value: "" },
        { label: "Group", children: fixture.options },
      ];
    let field = {
      uid: "options",
      typeClass: templateName,
      properties: {
        sampleData: true,
        defaultValue: multiple ? ["b"] : "b",
        oneLine: false,
      },
    } as Field;
    const type = {
      type: templateName,
      implements: multiple ? ["options", "multiValue"] : ["options"],
      properties: [],
      previewTemplate: readFileSync(
        resolve(
          import.meta.dirname,
          "../../../../../../../../plugin/src/Fields/Implementations/PreviewTemplates",
          `${templateName}.ejs`,
        ),
        "utf8",
      ),
    } as FieldType;
    const client = new QueryClient();
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    const Preview = () => {
      const [html] = useFieldPreview(field, type);
      const { refresh } = useSampleData();
      return (
        <>
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
          <button type="button" onClick={refresh}>
            Refresh
          </button>
        </>
      );
    };
    const view = () => (
      <QueryClientProvider client={client}>
        <SampleDataProvider>
          <Preview />
        </SampleDataProvider>
      </QueryClientProvider>
    );
    const selected = () =>
      Array.from(
        host.querySelectorAll<HTMLOptionElement | HTMLInputElement>(
          "option:checked, input:checked",
        ),
      ).map((el) =>
        el instanceof HTMLInputElement
          ? Array.from(host.querySelectorAll("input")).indexOf(el).toString()
          : el.value,
      );
    try {
      await act(async () => root.render(view()));
      const initial = selected();
      expect(multiple ? [2, 3] : [1]).toContain(initial.length);
      await act(async () => root.render(view()));
      expect(selected()).toEqual(initial);
      await act(async () => host.querySelector("button")?.click());
      expect(multiple ? [2, 3] : [1]).toContain(selected().length);
      expect(axios.get).not.toHaveBeenCalled();
      expect(field.properties.defaultValue).toEqual(multiple ? ["b"] : "b");
      field = {
        ...field,
        properties: { ...field.properties, sampleData: false },
      };
      await act(async () => root.render(view()));
      expect(selected()).toEqual([
        templateName === "radios" || templateName === "checkboxes" ? "1" : "b",
      ]);
    } finally {
      await act(async () => root.unmount());
      fixture.options = [];
      host.remove();
      client.clear();
      vi.unstubAllGlobals();
      vi.clearAllMocks();
    }
  },
);
