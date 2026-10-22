import type { ConditionalRulesProperty } from "@ff-client/types/properties";
import { Combinator } from "@ff-client/types/rules";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import ConditionalNotificationRules from "./conditional-rules";

vi.mock("@config/freeform/freeform.config", () => ({
  Edition: { Express: "express" },
  default: {
    editions: { isAtLeast: () => true },
    limitations: { can: () => true },
  },
}));
vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string) => text,
}));
vi.mock("@editor/store", () => ({ useAppDispatch: () => vi.fn() }));
vi.mock("@editor/store/slices/translations/translations.hooks", () => ({
  useTranslations: () => ({ hasTranslation: () => false }),
}));
vi.mock("react-redux", () => ({
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({
      form: { id: 1 },
      rules: {
        notifications: {
          initialized: true,
          items: [
            {
              uid: "rule",
              send: true,
              combinator: Combinator.Or,
              conditions: [],
            },
          ],
        },
      },
    }),
}));
vi.mock("@ff-client/queries/rules", () => ({
  useQueryNotificationRules: () => ({
    data: [{ uid: "rule" }],
    isFetched: true,
  }),
}));
it("displays the server validation error beside the notification rule editor", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);

  try {
    act(() =>
      root.render(
        <ConditionalNotificationRules
          property={
            {
              handle: "rule",
              label: "Notification Rule",
              required: true,
            } as ConditionalRulesProperty
          }
          value="rule"
          context={{ uid: "notification" } as never}
          updateValue={vi.fn()}
          errors={["Configure at least one condition for this notification."]}
        />,
      ),
    );

    expect(host.querySelector("li")?.textContent).toBe(
      "Configure at least one condition for this notification.",
    );
    expect(host.querySelector(".errors")?.textContent).toContain(
      "Notification Rule",
    );
    expect(host.querySelectorAll("select")).toHaveLength(2);
  } finally {
    act(() => root.unmount());
    host.remove();
    vi.unstubAllGlobals();
  }
});
