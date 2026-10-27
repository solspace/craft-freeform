export type SampleGenerator = { id: string; label: string; value: string };

// Preview only the expressions the picker inserts. Other Twig stays editable.
export const parseSampleExpression = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  if (
    /^\s*\{\{\s*faker\.sentences\s*\(\s*3\s*,\s*true\s*\)\s*(?:\|\s*raw\s*)?\}\}\s*$/.test(
      value,
    )
  )
    return "sentences";
  const id =
    /^\s*\{\{\s*faker\.([a-zA-Z]\w*)\s*(?:\(\s*\))?\s*(?:\|\s*raw\s*)?\}\}\s*$/.exec(
      value,
    )?.[1];
  // Faker returns an array unless the Sentences preset supplies its arguments.
  return id === "sentences" ? undefined : id;
};

export const sampleExpression = (id: string): string =>
  id === "sentences"
    ? "{{ faker.sentences(3, true)|raw }}"
    : `{{ faker.${id}|raw }}`;

export type SamplePart =
  | { type: "text"; value: string }
  | { type: "sample"; id: string; value: string };

export const sampleParts = (value: string): SamplePart[] => {
  const parts: SamplePart[] = [];
  let offset = 0;
  for (const match of value.matchAll(/\{\{[\s\S]*?\}\}/g)) {
    if (match.index > offset)
      parts.push({ type: "text", value: value.slice(offset, match.index) });
    const id = parseSampleExpression(match[0]);
    parts.push(
      id
        ? { type: "sample", id, value: match[0] }
        : { type: "text", value: match[0] },
    );
    offset = match.index + match[0].length;
  }
  if (offset < value.length)
    parts.push({ type: "text", value: value.slice(offset) });
  return parts;
};

export const resolveSamplePreview = (
  value: unknown,
  byId: ReadonlyMap<string, SampleGenerator>,
): SampleGenerator | undefined => {
  if (typeof value !== "string") return undefined;
  const parts = sampleParts(value);
  const generators: SampleGenerator[] = [];
  let rendered = "";
  for (const part of parts) {
    if (part.type === "text") {
      // Leave advanced Twig intact rather than showing a misleading partial result.
      if (/\{[{%#]/.test(part.value)) return undefined;
      rendered += part.value;
    } else {
      const generator = byId.get(part.id);
      if (!generator) return undefined;
      generators.push(generator);
      rendered += generator.value;
    }
  }
  return generators.length
    ? {
        id: generators.map((item) => item.id).join(","),
        label: [...new Set(generators.map((item) => item.label))].join(" + "),
        value: rendered,
      }
    : undefined;
};

const common = [
  "firstName",
  "lastName",
  "name",
  "email",
  "phoneNumber",
  "company",
  "streetAddress",
  "city",
  "postcode",
  "sentence",
];

export const groupGenerators = (
  catalog: readonly SampleGenerator[],
  fieldType: string,
  search: string,
): { common: SampleGenerator[]; others: SampleGenerator[] } => {
  const preferred: Record<string, string[]> = {
    email: ["email", "safeEmail", "companyEmail"],
    phone: ["phoneNumber", "e164PhoneNumber"],
    website: ["url", "domainName", "slug"],
    textarea: ["paragraph", "sentences", "text", "sentence"],
    password: ["password"],
    number: ["numberBetween", "randomNumber", "randomFloat"],
  };
  const top = [...new Set([...(preferred[fieldType] ?? []), ...common])].slice(
    0,
    10,
  );
  const needle = search.trim().toLocaleLowerCase();
  const matches = catalog.filter((item) =>
    `${item.label} ${item.id}`.toLocaleLowerCase().includes(needle),
  );
  return {
    common: top.flatMap((id) => matches.filter((item) => item.id === id)),
    others: matches
      .filter((item) => !top.includes(item.id))
      .sort((a, b) => a.label.localeCompare(b.label)),
  };
};
