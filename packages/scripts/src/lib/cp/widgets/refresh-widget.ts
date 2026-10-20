type RenderedWidget = { html: string; headHtml: string; bodyHtml: string };
type CraftApi = {
  sendActionRequest(
    method: string,
    action: string,
    options: { data: { widgetId: number } },
  ): Promise<{ data: RenderedWidget }>;
  appendHeadHtml(html: string): Promise<void>;
  appendBodyHtml(html: string): Promise<void>;
};

declare global {
  interface Window {
    Craft: CraftApi;
  }
}

export async function refreshWidget(
  root: HTMLElement,
  initialize: (root: HTMLElement) => void,
) {
  const widgetId = Number(root.dataset.widgetId);
  if (!widgetId) throw new Error("A saved widget is required.");
  const craft = window.Craft;
  const { data } = await craft.sendActionRequest(
    "POST",
    "freeform/widgets/refresh",
    { data: { widgetId } },
  );
  const template = document.createElement("template");
  template.innerHTML = data.html;
  const next = template.content.firstElementChild;
  if (
    !(next instanceof HTMLElement) ||
    next.dataset.widgetId !== String(widgetId) ||
    !root.isConnected
  ) {
    throw new Error("The widget could not be refreshed.");
  }
  // Bind widget handlers before Freeform's observer initializes the new form.
  initialize(next);
  root.replaceWith(next);
  await craft.appendHeadHtml(data.headHtml);
  await craft.appendBodyHtml(data.bodyHtml);
  return next;
}
