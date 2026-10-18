import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AiSetupModal } from "./modal.form.ai-setup";

const fixture = vi.hoisted(() => ({
  choose: vi.fn(),
  close: vi.fn(),
  back: vi.fn(),
  refetch: vi.fn(),
  edition: "pro",
  loading: false,
  error: false,
  providers: [
    {
      type: {
        name: "SolspaceAI",
        shortName: "SolspaceAIV1",
        editions: ["pro"],
        iconSvg: "<svg></svg>",
      },
      instances: [],
    },
    {
      type: {
        name: "OpenAI",
        shortName: "OpenAIV1",
        editions: ["pro"],
        iconSvg: "<svg></svg>",
      },
      instances: [{ id: "7" }],
    },
    {
      type: {
        name: "Anthropic",
        shortName: "AnthropicV1",
        editions: ["pro"],
        iconSvg: "<svg></svg>",
      },
      instances: [],
    },
  ],
}));
vi.mock("@config/freeform/freeform.config", () => ({
  default: {
    editions: {
      get edition() {
        return fixture.edition;
      },
    },
  },
}));
vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string) => text,
}));
vi.mock("../../../integrations/sidebar/sidebar.queries", () => ({
  useIntegrationNavigation: () => ({
    data:
      fixture.loading || fixture.error
        ? undefined
        : [{ handle: "ai", entries: fixture.providers }],
    isLoading: fixture.loading,
    isError: fixture.error,
    refetch: fixture.refetch,
  }),
}));
let host: HTMLDivElement;
let root: Root;
const render = () =>
  act(() =>
    root.render(
      <AiSetupModal
        onClose={fixture.close}
        onBack={fixture.back}
        onChoose={fixture.choose}
      />,
    ),
  );
const button = (text: string) =>
  Array.from(host.querySelectorAll<HTMLButtonElement>("button")).find(
    (button) => button.textContent?.includes(text),
  )!;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.clearAllMocks();
  fixture.loading = false;
  fixture.error = false;
  fixture.edition = "pro";
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  render();
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

it("features SolspaceAI and its trial, and links to each provider's actual setup", () => {
  expect(host.textContent).toContain(
    "Freeform Pro includes a 1,000-credit SolspaceAI trial.",
  );
  expect(host.querySelector(".ai-setup-featured h2")?.textContent).toBe(
    "SolspaceAI",
  );
  act(() => button("Set up SolspaceAI").click());
  expect(fixture.choose).toHaveBeenLastCalledWith(
    "/integrations/ai/SolspaceAIV1",
  );
  act(() => button("OpenAI").click());
  expect(fixture.choose).toHaveBeenLastCalledWith(
    "/integrations/ai/OpenAIV1/7",
  );
  act(() => button("Anthropic").click());
  expect(fixture.choose).toHaveBeenLastCalledWith(
    "/integrations/ai/AnthropicV1",
  );
});

it("keeps edition restrictions and provides a way back without enabling anything", () => {
  fixture.edition = "lite";
  render();
  expect(button("Set up SolspaceAI").disabled).toBe(true);
  expect(button("OpenAI").disabled).toBe(true);
  expect(host.textContent).toContain("Requires Freeform Pro.");
  act(() => button("Back").click());
  expect(fixture.back).toHaveBeenCalledOnce();
  expect(fixture.choose).not.toHaveBeenCalled();
});

it("handles provider loading and failures without offering broken setup links", () => {
  fixture.loading = true;
  render();
  expect(host.textContent).toContain("Loading AI providers…");
  expect(host.querySelector(".ai-setup-featured")).toBeNull();
  fixture.loading = false;
  fixture.error = true;
  render();
  expect(host.textContent).toContain("Could not load AI providers.");
  act(() => button("Try again").click());
  expect(fixture.refetch).toHaveBeenCalledOnce();
});
