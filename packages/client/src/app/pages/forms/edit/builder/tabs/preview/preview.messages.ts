export type PreviewValues = Record<string, string | string[]>;
export type PreviewMessage = {
  type: "freeform-preview";
  channel: string;
  action: "values" | "next" | "back";
  values: PreviewValues;
};

export const readPreviewMessage = (
  event: MessageEvent,
  frame: Window | null | undefined,
  channel?: string,
): PreviewMessage | undefined => {
  if (!frame || !channel || event.source !== frame || event.origin !== "null")
    return;
  const data = event.data;
  if (
    data?.type !== "freeform-preview" ||
    data.channel !== channel ||
    !["values", "next", "back"].includes(data.action)
  )
    return;
  const values = data.values;
  if (
    !values ||
    typeof values !== "object" ||
    Array.isArray(values) ||
    Object.keys(values).length > 500
  )
    return;
  if (
    Object.getPrototypeOf(values) !== Object.prototype &&
    Object.getPrototypeOf(values) !== null
  )
    return;
  for (const [key, value] of Object.entries(values)) {
    if (
      key.length > 100 ||
      ["__proto__", "constructor", "prototype"].includes(key)
    )
      return;
    const items = Array.isArray(value) ? value : [value];
    if (
      items.length > 100 ||
      Array.from(items).some(
        (item) => typeof item !== "string" || item.length > 10000,
      )
    )
      return;
  }
  if (new TextEncoder().encode(JSON.stringify(values)).length > 65536) return;
  return data;
};
