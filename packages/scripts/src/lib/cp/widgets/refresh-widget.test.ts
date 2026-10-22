import { afterEach, describe, expect, it, vi } from "vitest";
import { refreshWidget } from "./refresh-widget";

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});
describe("dashboard widget refresh", () => {
  it("uses the saved widget ID, binds fresh controls and loads Craft assets in order", async () => {
    const root = document.createElement("div");
    root.dataset.widgetId = "8";
    document.body.append(root);
    const order: string[] = [];
    const sendActionRequest = vi.fn().mockResolvedValue({
      data: {
        html: '<div data-widget-id="8"><form><input name="token" value="fresh"></form></div>',
        headHtml: "head",
        bodyHtml: "body",
      },
    });
    vi.stubGlobal("Craft", {
      sendActionRequest,
      appendHeadHtml: vi.fn(async () => {
        order.push("head");
      }),
      appendBodyHtml: vi.fn(async () => {
        order.push("body");
      }),
    });
    const next = await refreshWidget(root, (el) => {
      expect(el.isConnected).toBe(false);
      order.push("initialize");
    });
    expect(sendActionRequest).toHaveBeenCalledWith(
      "POST",
      "freeform/widgets/refresh",
      { data: { widgetId: 8 } },
    );
    expect(next.isConnected).toBe(true);
    expect(root.isConnected).toBe(false);
    expect(order).toEqual(["initialize", "head", "body"]);
    expect(next.querySelector<HTMLInputElement>("input")!.value).toBe("fresh");
  });
  it("keeps the original widget if the request fails or the response does not match", async () => {
    const root = document.createElement("div");
    root.dataset.widgetId = "8";
    document.body.append(root);
    const sendActionRequest = vi
      .fn()
      .mockRejectedValueOnce(new Error("Offline"))
      .mockResolvedValueOnce({
        data: { html: '<div data-widget-id="9"></div>' },
      });
    vi.stubGlobal("Craft", { sendActionRequest });
    await expect(refreshWidget(root, vi.fn())).rejects.toThrow("Offline");
    await expect(refreshWidget(root, vi.fn())).rejects.toThrow(
      "could not be refreshed",
    );
    expect(root.isConnected).toBe(true);
  });
});
