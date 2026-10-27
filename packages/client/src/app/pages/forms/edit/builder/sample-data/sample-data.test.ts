import { expect, it } from "vitest";
import {
  groupGenerators,
  parseSampleExpression,
  resolveSamplePreview,
  type SampleGenerator,
  sampleExpression,
} from "./sample-data";

it.each([
  ["{{ faker.firstName }}", "firstName"],
  ["{{faker.company|raw}}", "company"],
  [" {{ faker.email() | raw }} ", "email"],
  ["{{ faker.sentences(3, true) }}", "sentences"],
  [" {{ faker.sentences( 3 , true ) | raw }} ", "sentences"],
  ["{{ faker.sentences(6, true) }}", undefined],
  ["{{ faker.sentences(3, false) }}", undefined],
  ["{{ faker.sentences }}", undefined],
  ["{{ faker.numberBetween(1, 10) }}", undefined],
  ["Hello {{ faker.name }}", undefined],
  ["{{ faker.email|upper }}", undefined],
  ["{{ craft.entries.all() }}", undefined],
  ["{{ faker.file }}", "file"],
  [null, undefined],
])("recognizes only simple Faker expressions (%s)", (value, expected) => {
  expect(parseSampleExpression(value)).toBe(expected);
});

it("inserts a complete raw expression", () => {
  expect(sampleExpression("company")).toBe("{{ faker.company|raw }}");
  expect(sampleExpression("sentences")).toBe(
    "{{ faker.sentences(3, true)|raw }}",
  );
});

it("prioritizes three sentences for textareas and previews the fixed preset", () => {
  const sentences = {
    id: "sentences",
    label: "Sentences",
    value: "One sentence. Another sentence. A third sentence.",
  };
  const catalog = [sentences];
  expect(groupGenerators(catalog, "textarea", "").common).toEqual(catalog);
  expect(groupGenerators(catalog, "text", "sentences").others).toEqual(catalog);
  expect(
    resolveSamplePreview(
      sampleExpression("sentences"),
      new Map([["sentences", sentences]]),
    )?.value,
  ).toBe(sentences.value);
});

it("combines cached samples with text and preserves unsupported Twig verbatim", () => {
  const byId = new Map([
    ["firstName", { id: "firstName", label: "First name", value: "Alex" }],
    ["lastName", { id: "lastName", label: "Last name", value: "Smith" }],
  ]);
  expect(
    resolveSamplePreview(
      " {{ faker.firstName|raw }}123 {{ faker.lastName }} ",
      byId,
    )?.value,
  ).toBe(" Alex123 Smith ");
  expect(
    resolveSamplePreview("{{ faker.firstName }}{{ faker.firstName }}", byId)
      ?.value,
  ).toBe("AlexAlex");
  expect(
    resolveSamplePreview("{{ faker.firstName }} {{ faker.file }}", byId),
  ).toBeUndefined();
  expect(
    resolveSamplePreview("{{ faker.firstName }} {{ otherVariable }}", byId),
  ).toBeUndefined();
  expect(
    resolveSamplePreview(
      "{% if enabled %}{{ faker.firstName }}{% endif %}",
      byId,
    ),
  ).toBeUndefined();
  expect(resolveSamplePreview("Plain text", byId)).toBeUndefined();
});

it("prioritizes the field type, sorts remaining labels, and searches by name or method", () => {
  const catalog = [
    { id: "company", label: "Company name" },
    { id: "email", label: "Email address" },
    { id: "url", label: "Website URL" },
    { id: "jobTitle", label: "Job title" },
    { id: "address", label: "Address" },
    { id: "safeEmail", label: "Example email address" },
  ].map((item) => ({ ...item, value: "Sample" })) as SampleGenerator[];
  const groups = groupGenerators(catalog, "email", "");
  expect(groups.common.map((item) => item.id)).toEqual([
    "email",
    "safeEmail",
    "company",
  ]);
  expect(groups.others.map((item) => item.id)).toEqual([
    "address",
    "jobTitle",
    "url",
  ]);
  expect(
    new Set([...groups.common, ...groups.others].map((item) => item.id)).size,
  ).toBe(catalog.length);
  expect(
    groupGenerators(catalog, "text", "jobtitle").others.map((item) => item.id),
  ).toEqual(["jobTitle"]);
  expect(
    groupGenerators(catalog, "text", "company name").common.map(
      (item) => item.id,
    ),
  ).toEqual(["company"]);
  expect(groupGenerators(catalog, "text", "zzzz")).toEqual({
    common: [],
    others: [],
  });
});
