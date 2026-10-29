/** Settings whose visibility follows a boolean or boolean environment variable. */
export function controllingToggle(
  className: string,
  handle: string,
): string | undefined {
  if (
    handle === "customUrl" &&
    [
      "Solspace\\Freeform\\Integrations\\CRM\\Pardot\\Versions\\PardotV4",
      "Solspace\\Freeform\\Integrations\\CRM\\Salesforce\\Versions\\SalesforceV58",
    ].includes(className)
  )
    return "useCustomUrl";
  if (
    handle === "errorMessage" &&
    [
      "Solspace\\Freeform\\Integrations\\SpamBlocking\\Emails\\BlockEmailAddresses",
      "Solspace\\Freeform\\Integrations\\SpamBlocking\\Keywords\\BlockKeywords",
    ].includes(className)
  )
    return "errorsBelowFields";
  if (
    ["defaultDnsBlockLists", "dnsBlockLists"].includes(handle) &&
    className ===
      "Solspace\\Freeform\\Integrations\\SpamBlocking\\IpAddresses\\BlockIpAddresses"
  )
    return "checkDnsBlockLists";
  return undefined;
}
