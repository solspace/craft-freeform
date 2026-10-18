import type { Field } from "@editor/store/slices/layout/fields";
import type { FieldType } from "@ff-client/types/fields";
import { PropertyType } from "@ff-client/types/properties";
import { expect, it } from "vitest";
import {
  type Capitalization,
  type ColonStyle,
  collectLabels,
  formatLabel,
} from "./label-utility.operations";

it.each<[string, Capitalization, ColonStyle, string]>([
  ["First NAME:", "keep", "keep", "First NAME:"],
  ["  FIRST name:", "sentence", "keep", "  First name:"],
  ["first and last name", "title", "add", "First And Last Name:"],
  ["Home address :  ", "upper", "remove", "HOME ADDRESS"],
  ["EMAIL Address", "lower", "keep", "email address"],
  ["Name: :  ", "keep", "add", "Name:"],
  ["Name：", "keep", "remove", "Name"],
  ["Name  ", "keep", "keep", "Name  "],
  ["Name  ", "keep", "remove", "Name  "],
  ["Are you insured?", "sentence", "add", "Are you insured?"],
  ["Please explain!", "keep", "add", "Please explain!"],
  ["", "upper", "add", ""],
  ["  ", "keep", "add", ""],
  ["ÉTAT CIVIL", "sentence", "add", "État civil:"],
  ["l’adresse d’expédition", "title", "keep", "L’adresse D’expédition"],
])("formats %s with %s / %s", (label, capitalization, colons, expected) => {
  expect(formatLabel(label, { capitalization, colons, locale: "en" })).toBe(
    expected,
  );
});
it("uses locale-aware capitalization", () => {
  expect(
    formatLabel("iletişim", {
      capitalization: "upper",
      colons: "keep",
      locale: "tr",
    }),
  ).toBe("İLETİŞİM");
});

const field = (
  uid: string,
  label: string,
  rowUid = "r1",
  typeClass = "Text",
  properties = {},
): Field => ({
  uid,
  rowUid,
  typeClass,
  properties: { label, handle: uid, ...properties },
});
const type = (typeClass: string, name: string, extra = {}): FieldType => ({
  typeClass,
  type: name,
  name,
  visible: true,
  implements: [],
  properties: [
    { handle: "label", type: PropertyType.String, translatable: true },
  ],
  ...extra,
});
const types = [
  type("Text", "text"),
  type("Group", "group"),
  type("HTML", "html"),
  type("RichText", "rich-text"),
  type("Hidden", "hidden", { implements: ["noLabel"] }),
  type("Locked", "text", {
    properties: [{ handle: "label", flags: ["as-readonly-in-instance"] }],
  }),
];
const layout = {
  pages: [
    { uid: "p1", label: "Contact", layoutUid: "l1", order: 0 },
    { uid: "p2", label: "Details", layoutUid: "l2", order: 1 },
  ],
  rows: [
    { uid: "r1", layoutUid: "l1", order: 0 },
    { uid: "r2", layoutUid: "l2", order: 0 },
    { uid: "nested", layoutUid: "group-layout", order: 0 },
  ],
  fields: [
    field("a", "First name"),
    field("b", "Email", "r2"),
    field("g", "Phone numbers", "r1", "Group", { layout: "group-layout" }),
    field("c", "Home", "nested"),
    field("html", "Internal name", "r1", "HTML"),
    field("rt", "Internal name", "r1", "RichText"),
    field("hidden", "Hidden", "r1", "Hidden"),
    field("locked", "Locked", "r1", "Locked"),
    field("rich", '<p>Accept <a href="/terms">terms</a></p>'),
    field("twig", "{{ dynamicLabel }}"),
    field("entity", "Name&nbsp;"),
    field("empty", ""),
  ],
  types,
  translations: {},
};
it("collects editable labels across all pages and nested groups, excluding content, hidden, rich and dynamic labels", () => {
  const result = collectLabels(layout);
  expect(result.candidates.map(({ uid }) => uid)).toEqual(["a", "g", "c", "b"]);
  expect(result.skipped).toBe(3);
});
it("scopes the current page including nested group fields", () => {
  expect(
    collectLabels({ ...layout, pageUid: "p2" }).candidates.map(
      ({ uid }) => uid,
    ),
  ).toEqual(["b"]);
  expect(
    collectLabels({ ...layout, pageUid: "p1" }).candidates.map(
      ({ uid }) => uid,
    ),
  ).toEqual(["a", "g", "c"]);
});
it("uses selected-site translations and inherited labels without mutating the originals", () => {
  const translations = {
    2: {
      fields: { a: { label: "Prénom" }, b: { label: "" } },
      form: {},
      pages: {},
    },
  };
  const result = collectLabels({ ...layout, translations, siteId: 2 });
  expect(
    result.candidates.map(({ uid, label, siteId }) => ({ uid, label, siteId })),
  ).toEqual([
    { uid: "a", label: "Prénom", siteId: 2 },
    { uid: "g", label: "Phone numbers", siteId: 2 },
    { uid: "c", label: "Home", siteId: 2 },
  ]);
  expect(layout.fields[0].properties.label).toBe("First name");
});
it("keeps non-translatable labels on the base form and handles circular group references", () => {
  const result = collectLabels({
    ...layout,
    siteId: 2,
    types: [
      type("Text", "text", {
        properties: [{ handle: "label", translatable: false }],
      }),
      type("Group", "group"),
    ],
    fields: [
      field("a", "First name"),
      field("g", "Group", "r1", "Group", { layout: "l1" }),
    ],
  });
  expect(result.candidates).toHaveLength(2);
  expect(result.candidates[0].siteId).toBeUndefined();
});

it("replaces every literal match, supports case sensitivity and deletion, and treats replacement text literally", () => {
  const settings = { capitalization: "keep", colons: "keep" } as const;
  expect(
    formatLabel("Phone PHONE phone", {
      ...settings,
      find: "Phone",
      replacement: "Number",
    }),
  ).toBe("Number Number Number");
  expect(
    formatLabel("Phone PHONE phone", {
      ...settings,
      find: "Phone",
      replacement: "Number",
      matchCase: true,
    }),
  ).toBe("Number PHONE phone");
  expect(
    formatLabel("Optional Email", {
      ...settings,
      find: "Optional ",
      replacement: "",
    }),
  ).toBe("Email");
  expect(
    formatLabel("a.b + a?b", { ...settings, find: "a.b", replacement: "$&" }),
  ).toBe("$& + a?b");
  expect(
    formatLabel("Email", { ...settings, find: "", replacement: "New" }),
  ).toBe("Email");
});
it("cleans whitespace only when requested and composes formatting in a predictable order", () => {
  const label = " \tCUSTOMER\u00a0  ID :  ";
  expect(formatLabel(label, { capitalization: "keep", colons: "keep" })).toBe(
    label,
  );
  expect(
    formatLabel(label, {
      capitalization: "sentence",
      colons: "remove",
      cleanSpacing: true,
      preserveAcronyms: true,
      find: "customer",
      replacement: "Member",
    }),
  ).toBe("Member ID");
});
it("preserves existing common acronyms without mistaking ordinary uppercase words or substrings for acronyms", () => {
  const settings = {
    capitalization: "sentence",
    colons: "keep",
    preserveAcronyms: true,
  } as const;
  expect(formatLabel("YOUR ID AND PDF URL", settings)).toBe(
    "Your ID and PDF URL",
  );
  expect(
    formatLabel("ZIP code and VAT ID", {
      ...settings,
      capitalization: "title",
    }),
  ).toBe("ZIP Code And VAT ID");
  expect(formatLabel("ID's URL and PDF’s title", settings)).toBe(
    "ID's URL and PDF’s title",
  );
  expect(
    formatLabel("IDentifier and user profile", {
      ...settings,
      capitalization: "title",
    }),
  ).toBe("Identifier And User Profile");
  expect(
    formatLabel("Contact us", { ...settings, capitalization: "title" }),
  ).toBe("Contact Us");
  expect(
    formatLabel("ID AND URL", { ...settings, preserveAcronyms: false }),
  ).toBe("Id and url");
  expect(
    formatLabel("ID AND URL", { ...settings, capitalization: "lower" }),
  ).toBe("id and url");
});
it("includes field-type identity when collecting translated and nested labels", () => {
  const result = collectLabels(layout);
  expect(
    result.candidates
      .filter((candidate) => candidate.typeClass === "Group")
      .map(({ uid }) => uid),
  ).toEqual(["g"]);
  expect(
    result.candidates
      .filter((candidate) => candidate.typeClass === "Text")
      .map(({ uid }) => uid),
  ).toEqual(["a", "c", "b"]);
});
it("includes plain checkbox labels even though they render without a wrapper label, while excluding rich checkbox content", () => {
  const result = collectLabels({
    ...layout,
    types: [type("Checkbox", "checkbox", { implements: ["noLabel"] })],
    fields: [
      field("plain-checkbox", "Accept terms", "r1", "Checkbox"),
      field(
        "rich-checkbox",
        '<p>Accept the <a href="/terms">terms</a></p>',
        "r1",
        "Checkbox",
      ),
    ],
  });
  expect(result.candidates.map(({ uid }) => uid)).toEqual(["plain-checkbox"]);
  expect(result.skipped).toBe(1);
});
