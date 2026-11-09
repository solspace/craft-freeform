import { describe, expect, it } from "vitest";
import { integrationLabel, integrationSidebarLabel } from "./integration-label";

describe("integration display names", () => {
  it("keeps long sidebar names compact without changing other labels", () => {
    expect(
      integrationSidebarLabel(
        "Salesforce Account Engagement (Pardot)",
        "PardotV4",
      ),
    ).toBe("Account Engagement");
    expect(
      integrationSidebarLabel("Blocked Email Addresses", "BlockEmailAddresses"),
    ).toBe("Blocked Emails");
    expect(integrationSidebarLabel("Salesforce CRM", "SalesforceV58")).toBe(
      "Salesforce CRM",
    );
  });
  it("updates old product names for Salesforce connections", () => {
    expect(integrationLabel("Pardot", "PardotV4")).toBe(
      "Salesforce Account Engagement",
    );
    expect(integrationLabel("Salesforce", "SalesforceV58")).toBe(
      "Salesforce CRM",
    );
  });
  it("preserves custom connection names and names on other integrations", () => {
    expect(integrationLabel("Pardot - Europe", "PardotV4")).toBe(
      "Pardot - Europe",
    );
    expect(integrationLabel("Salesforce sandbox", "SalesforceV58")).toBe(
      "Salesforce sandbox",
    );
    expect(integrationLabel("Pardot", "OtherIntegration")).toBe("Pardot");
  });
});
