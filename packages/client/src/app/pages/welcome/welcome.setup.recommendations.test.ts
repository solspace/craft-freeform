import { describe, expect, it } from "vitest";
import {
  initialAnswers,
  recommendationsFor,
} from "./welcome.setup.recommendations";
import { setupOptions } from "./welcome.setup.test-fixtures";

const context = {
  ...initialAnswers,
  maintainer: "editors",
  rendering: "samples",
  scale: "basic",
  reuse: "shared",
};
const plan = (changes = {}) =>
  recommendationsFor({ ...context, ...changes }, setupOptions);
describe("workflow recommendations", () => {
  it("maps editor ownership and reuse to actual template settings", () => {
    const proposed = Object.fromEntries(
      plan().map((item) => [item.key, item.value]),
    );
    expect(proposed).toMatchObject({
      emailTemplateMethod: "all",
      emailTemplateStorageType: "database",
      emailTemplateDefault: "database",
      activityMode: "minimal",
    });
    expect(
      plan().find((item) => item.key === "defaultFormattingTemplate")?.scope,
    ).toBe("New form default");
  });
  it("does not change script or security settings for headless sites", () => {
    expect(
      plan({ rendering: "headless" }).some(
        (item) => item.key === "defaultFormattingTemplate",
      ),
    ).toBe(false);
    expect(
      plan({ rendering: "headless" }).some((item) =>
        /script|csrf|session/i.test(item.key),
      ),
    ).toBe(false);
  });
  it("never enables queues without an explicit runner confirmation", () => {
    expect(
      plan({
        needs: ["emails", "external", "aiProcessing"],
        queue: "unsure",
      }).some((item) => item.key.startsWith("useQueue")),
    ).toBe(false);
    expect(
      plan({ needs: ["external"], queue: "ready" })
        .filter((item) => item.key.startsWith("useQueue"))
        .map((item) => item.key),
    ).toEqual(["useQueueForIntegrations"]);
  });
  it("preserves custom logging and does not infer data deletion or IP collection changes", () => {
    const result = recommendationsFor(context, {
      ...setupOptions,
      values: { ...setupOptions.values, activityMode: "custom" },
    });
    expect(result.find((item) => item.key === "activityMode")?.value).toBe(
      "custom",
    );
    expect(result.some((item) => /purge|collectIp/i.test(item.key))).toBe(
      false,
    );
  });
  it("selects a sole allowed upload destination and leaves multiple destinations optional", () => {
    expect(plan().some((item) => item.scope === "New field default")).toBe(
      false,
    );
    const uploads = plan({ needs: ["uploads"], uploadKind: "image,pdf" });
    expect(
      uploads.find((item) => item.key === "defaultUploadSource")?.optional,
    ).toBe(false);
    const multiple = recommendationsFor(
      { ...context, needs: ["uploads"] },
      {
        ...setupOptions,
        catalog: {
          ...setupOptions.catalog,
          defaultUploadSource: [
            { value: "4", label: "Images" },
            { value: "5", label: "Documents" },
          ],
        },
      },
    );
    expect(
      multiple.find((item) => item.key === "defaultUploadSource")?.optional,
    ).toBe(true);
    expect(
      uploads.find((item) => item.key === "defaultUploadKinds")?.value,
    ).toBe("image,pdf");
  });
  it("selects requested error alerts without inventing recipients and keeps digests optional", () => {
    const result = plan({ needs: ["reliability", "review"] });
    for (const key of [
      "alertNotificationRecipients",
      "errorNotificationRecipients",
    ]) {
      const item = result.find((item) => item.key === key)!;
      expect(item.optional).toBe(false);
      expect(item.value).toBe("");
    }
    expect(
      result.find((item) => item.key === "clientDigestRecipients")?.optional,
    ).toBe(true);
    expect(
      result.find((item) => item.key === "clientDigestFrequency")?.optional,
    ).toBe(true);
  });
  it("does not propose unavailable AI providers or edition-gated email features", () => {
    const result = recommendationsFor(
      { ...context, needs: ["ai", "review", "reliability"] },
      { ...setupOptions, canUseAi: false, canUseAlerts: false },
    );
    expect(
      result.some((item) =>
        [
          "defaultAiIntegration",
          "clientDigestRecipients",
          "alertNotificationRecipients",
        ].includes(item.key),
      ),
    ).toBe(false);
  });
});
