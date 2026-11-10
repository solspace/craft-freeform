/** Keep renamed product labels current without overwriting saved connection names. */
export function integrationLabel(name: string, shortName?: string): string {
  if (shortName === "PardotV4" && name.trim() === "Pardot") {
    return "Salesforce Account Engagement";
  }
  if (shortName === "SalesforceV58" && name.trim() === "Salesforce") {
    return "Salesforce CRM";
  }
  return name;
}

export function integrationSidebarLabel(
  name: string,
  shortName?: string,
): string {
  if (shortName === "PardotV4") return "Account Engagement";
  if (shortName === "BlockEmailAddresses") return "Blocked Emails";
  return name;
}
