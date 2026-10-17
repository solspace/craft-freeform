import { EscapeStackProvider } from "@ff-client/contexts/escape/escape.context";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { StartFormModal } from "./modal.form.start";

const fixture = vi.hoisted(() => ({
  close: vi.fn(),
  navigate: vi.fn(),
  config: {
    editions: { edition: "pro" },
    permissions: { integrations: "manage" },
    metadata: {
      freeform: { formCreationOptions: undefined as string[] | undefined },
    },
  },
  integrations: {
    data: [{ uid: "ai" }] as { uid: string }[] | undefined,
    isLoading: false,
  },
  availability: {
    data: { canCreate: true } as { canCreate: boolean } | undefined,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  },
}));
vi.mock("@config/freeform/freeform.config", () => ({
  default: fixture.config,
  Edition: { Express: "express" },
}));
vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string) => text,
}));
vi.mock("react-router-dom", () => ({ useNavigate: () => fixture.navigate }));
vi.mock("./modal.form.create-with-ai.queries", () => ({
  useAiIntegrations: () => fixture.integrations,
}));
vi.mock("./modal.form.queries", () => ({
  useFormCreationAvailability: () => fixture.availability,
}));
vi.mock("./modal.form.ai-setup", () => ({
  AiSetupModal: ({
    onChoose,
    onBack,
  }: {
    onChoose: (path: string) => void;
    onBack?: () => void;
  }) => (
    <div>
      <button
        type="button"
        aria-label="Choose SolspaceAI"
        onClick={() => onChoose("/integrations/ai/SolspaceAIV1")}
      >
        Choose SolspaceAI
      </button>
      {onBack && (
        <button type="button" onClick={onBack}>
          Back to choices
        </button>
      )}
    </div>
  ),
}));
vi.mock("./modal.form.create", () => ({
  CreateFormModal: ({ closeModal }: { closeModal: () => void }) => (
    <button onClick={closeModal} type="button">
      Blank setup
    </button>
  ),
}));
vi.mock("./modal.form.create-with-ai", () => ({
  CreateWithAiFormModal: ({ closeModal }: { closeModal: () => void }) => (
    <button onClick={closeModal} type="button">
      AI setup
    </button>
  ),
}));
vi.mock("./wizard/wizard", () => ({
  FormWizardModal: ({ closeModal }: { closeModal: () => void }) => (
    <button onClick={closeModal} type="button">
      Wizard setup
    </button>
  ),
}));

let host: HTMLDivElement;
let root: Root;
const card = (name: string) =>
  host.querySelector<HTMLButtonElement>(`[aria-label="${name}"]`)!;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.clearAllMocks();
  vi.useFakeTimers();
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
  fixture.config.permissions.integrations = "manage";
  fixture.config.editions.edition = "pro";
  fixture.config.metadata.freeform.formCreationOptions = undefined;
  fixture.integrations = { data: [{ uid: "ai" }], isLoading: false };
  fixture.availability.data = { canCreate: true };
  fixture.availability.isFetching = false;
  fixture.availability.isError = false;
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() =>
    root.render(
      <EscapeStackProvider>
        <StartFormModal closeModal={fixture.close} />
      </EscapeStackProvider>,
    ),
  );
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it.each([
  ["Guided setup", "Wizard setup"],
  ["Create with AI", "AI setup"],
  ["Quick setup", "Blank setup"],
])("opens %s directly in place of the chooser", async (method, result) => {
  expect(host.querySelectorAll(".form-start-card")).toHaveLength(3);
  act(() => card(method).click());
  expect(host.querySelector('[data-leaving="true"]')).not.toBeNull();
  expect(card("Guided setup").disabled).toBe(true);
  await act(async () => vi.advanceTimersByTimeAsync(180));
  expect(host.querySelector(".form-start-options")).toBeNull();
  expect(host.textContent).toBe(result);
  expect(fixture.close).not.toHaveBeenCalled();
  act(() => host.querySelector<HTMLButtonElement>("button")!.click());
  expect(fixture.close).toHaveBeenCalledOnce();
});

it("keeps keyboard focus in the chooser and closes with Escape", () => {
  expect(document.activeElement).toBe(card("Guided setup"));
  const last = card("Quick setup");
  last.focus();
  act(() =>
    last.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Tab",
        bubbles: true,
        cancelable: true,
      }),
    ),
  );
  expect(document.activeElement).toBe(card("Close"));
  act(() =>
    card("Close").dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Tab",
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      }),
    ),
  );
  expect(document.activeElement).toBe(last);
  act(() =>
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    ),
  );
  expect(fixture.close).toHaveBeenCalledOnce();
});

it("directs unconfigured AI to integration setup", async () => {
  fixture.integrations.data = [];
  act(() =>
    root.render(
      <EscapeStackProvider>
        <StartFormModal closeModal={fixture.close} />
      </EscapeStackProvider>,
    ),
  );
  expect(host.textContent).toContain(
    "Choose SolspaceAI or connect your own provider to use this option.",
  );
  act(() => card("Create with AI").click());
  expect(fixture.navigate).not.toHaveBeenCalled();
  await act(async () => vi.advanceTimersByTimeAsync(180));
  expect(fixture.close).not.toHaveBeenCalled();
  expect(card("Choose SolspaceAI")).not.toBeNull();
  act(() => card("Choose SolspaceAI").click());
  expect(fixture.close).toHaveBeenCalledOnce();
  expect(fixture.navigate).toHaveBeenCalledWith(
    "/integrations/ai/SolspaceAIV1",
  );
});

it("explains unavailable AI while keeping wizard and blank setup usable", () => {
  fixture.config.permissions.integrations = "none";
  act(() =>
    root.render(
      <EscapeStackProvider>
        <StartFormModal closeModal={fixture.close} />
      </EscapeStackProvider>,
    ),
  );
  expect(card("Create with AI").disabled).toBe(true);
  expect(host.textContent).toContain(
    "AI integrations are not available with your permissions.",
  );
  expect(card("Guided setup").disabled).toBe(false);
  expect(card("Quick setup").disabled).toBe(false);
});

it("opens immediately with reduced motion", () => {
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
  act(() => card("Quick setup").click());
  expect(host.querySelector(".form-start-options")).toBeNull();
  expect(host.textContent).toBe("Blank setup");
});

it("cancels a pending selection if the chooser is dismissed", async () => {
  act(() => card("Guided setup").click());
  act(() =>
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    ),
  );
  expect(fixture.close).toHaveBeenCalledOnce();
  await act(async () => vi.advanceTimersByTimeAsync(500));
  expect(host.querySelector(".form-start-options")).not.toBeNull();
  expect(host.textContent).not.toContain("Wizard setup");
});

it("only shows the creation methods enabled in General settings", () => {
  fixture.config.metadata.freeform.formCreationOptions = ["blank", "wizard"];
  act(() =>
    root.render(
      <EscapeStackProvider>
        <StartFormModal closeModal={fixture.close} />
      </EscapeStackProvider>,
    ),
  );
  expect(host.querySelectorAll(".form-start-card")).toHaveLength(2);
  expect(card("Create with AI")).toBeNull();
});

it.each(["lite", "express"])(
  "omits AI on %s while keeping the wizard available",
  (edition) => {
    fixture.config.editions.edition = edition;
    act(() =>
      root.render(
        <EscapeStackProvider>
          <StartFormModal closeModal={fixture.close} />
        </EscapeStackProvider>,
      ),
    );
    expect(host.querySelectorAll(".form-start-card")).toHaveLength(2);
    expect(card("Create with AI")).toBeNull();
    expect(card("Guided setup").disabled).toBe(false);
    expect(card("Quick setup").disabled).toBe(false);
  },
);

it("bypasses the chooser after filtering out AI on Lite", async () => {
  act(() => root.unmount());
  fixture.config.editions.edition = "lite";
  fixture.config.metadata.freeform.formCreationOptions = ["wizard", "ai"];
  root = createRoot(host);
  await act(async () =>
    root.render(
      <EscapeStackProvider>
        <StartFormModal closeModal={fixture.close} />
      </EscapeStackProvider>,
    ),
  );
  expect(host.querySelector(".form-start-options")).toBeNull();
  expect(host.textContent).toBe("Wizard setup");
});

it("keeps form creation available after downgrading an AI-only configuration", () => {
  fixture.config.editions.edition = "express";
  fixture.config.metadata.freeform.formCreationOptions = ["ai"];
  act(() =>
    root.render(
      <EscapeStackProvider>
        <StartFormModal closeModal={fixture.close} />
      </EscapeStackProvider>,
    ),
  );
  expect(host.querySelectorAll(".form-start-card")).toHaveLength(2);
  expect(card("Create with AI")).toBeNull();
});

it.each([
  ["wizard", "Wizard setup"],
  ["blank", "Blank setup"],
  ["ai", "AI setup"],
])("bypasses the chooser when only %s is enabled", async (method, text) => {
  act(() => root.unmount());
  fixture.config.metadata.freeform.formCreationOptions = [method];
  root = createRoot(host);
  await act(async () =>
    root.render(
      <EscapeStackProvider>
        <StartFormModal closeModal={fixture.close} />
      </EscapeStackProvider>,
    ),
  );
  expect(host.querySelector(".form-start-options")).toBeNull();
  expect(host.textContent).toBe(text);
});

it("opens provider choices directly when AI is the sole method and has no integration", async () => {
  act(() => root.unmount());
  fixture.config.metadata.freeform.formCreationOptions = ["ai"];
  fixture.integrations.data = [];
  root = createRoot(host);
  await act(async () =>
    root.render(
      <EscapeStackProvider>
        <StartFormModal closeModal={fixture.close} />
      </EscapeStackProvider>,
    ),
  );
  expect(host.querySelector(".form-start-options")).toBeNull();
  expect(card("Choose SolspaceAI")).not.toBeNull();
  expect(fixture.navigate).not.toHaveBeenCalled();
});

it("does not bypass integration permissions when AI is the only enabled method", () => {
  act(() => root.unmount());
  fixture.config.metadata.freeform.formCreationOptions = ["ai"];
  fixture.config.permissions.integrations = "none";
  root = createRoot(host);
  act(() =>
    root.render(
      <EscapeStackProvider>
        <StartFormModal closeModal={fixture.close} />
      </EscapeStackProvider>,
    ),
  );
  expect(host.textContent).toContain(
    "AI integrations are not available with your permissions.",
  );
  expect(host.textContent).not.toContain("AI setup");
});

const renderExpress = () => {
  fixture.config.editions.edition = "express";
  act(() =>
    root.render(
      <EscapeStackProvider>
        <StartFormModal closeModal={fixture.close} />
      </EscapeStackProvider>,
    ),
  );
};

it("checks the Express limit before displaying any creation options", () => {
  fixture.availability.data = undefined;
  fixture.availability.isFetching = true;
  renderExpress();
  expect(host.textContent).toContain("Loading…");
  expect(host.querySelectorAll(".form-start-card")).toHaveLength(0);

  fixture.availability.data = { canCreate: true };
  fixture.availability.isFetching = false;
  renderExpress();
  expect(host.querySelectorAll(".form-start-card")).toHaveLength(2);
});

it.each([undefined, ["blank"], ["wizard"]])(
  "shows the Express limit notice even when the chooser would be bypassed (%s)",
  (methods) => {
    fixture.config.metadata.freeform.formCreationOptions = methods;
    fixture.availability.data = { canCreate: false };
    renderExpress();
    expect(host.textContent).toContain(
      "Express includes one form, and yours is already set up.",
    );
    expect(host.querySelectorAll(".form-start-card")).toHaveLength(0);
    expect(host.textContent).not.toContain("Blank setup");
    expect(host.textContent).not.toContain("Wizard setup");
    expect(document.activeElement?.textContent).toBe("Close");
    act(() => host.querySelector<HTMLButtonElement>("button")!.click());
    expect(fixture.close).toHaveBeenCalledOnce();
  },
);

it("keeps creation blocked on a failed limit check and allows retry", () => {
  fixture.availability.data = undefined;
  fixture.availability.isError = true;
  renderExpress();
  expect(host.textContent).toContain("Could not check the form limit.");
  expect(host.querySelectorAll(".form-start-card")).toHaveLength(0);
  act(() =>
    Array.from(host.querySelectorAll("button"))
      .find((button) => button.textContent === "Try again")!
      .click(),
  );
  expect(fixture.availability.refetch).toHaveBeenCalledOnce();
  act(() =>
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    ),
  );
  expect(fixture.close).toHaveBeenCalledOnce();
});

it.each(["lite", "pro"])(
  "does not apply the Express limit on %s",
  (edition) => {
    fixture.config.editions.edition = edition;
    fixture.availability.data = { canCreate: false };
    act(() =>
      root.render(
        <EscapeStackProvider>
          <StartFormModal closeModal={fixture.close} />
        </EscapeStackProvider>,
      ),
    );
    expect(host.querySelectorAll(".form-start-card").length).toBeGreaterThan(0);
    expect(host.textContent).not.toContain("Need more forms?");
  },
);

it("links to the Freeform plugin store in a new tab and keeps the link in the focus loop", () => {
  fixture.availability.data = { canCreate: false };
  renderExpress();
  const link = host.querySelector<HTMLAnchorElement>("a")!;
  expect(link.textContent).toBe("Compare editions");
  expect(link.href).toBe(
    "https://docs.solspace.com/craft/freeform/v5/#pricing",
  );
  expect(link.target).toBe("_blank");
  expect(link.rel).toBe("noopener noreferrer");
  const close = host.querySelector<HTMLButtonElement>("button")!;
  act(() =>
    close.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Tab",
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      }),
    ),
  );
  expect(document.activeElement).toBe(link);
  act(() =>
    link.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Tab",
        bubbles: true,
        cancelable: true,
      }),
    ),
  );
  expect(document.activeElement).toBe(close);
});
