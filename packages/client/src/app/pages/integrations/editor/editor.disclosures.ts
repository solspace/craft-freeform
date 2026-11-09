import { captchaProvider } from "./editor.captchas";

export function hasIntegrationDisclosure(className: string): boolean {
  return (
    Boolean(captchaProvider(className)) ||
    [
      "Solspace\\Freeform\\Integrations\\CRM\\Pardot\\Versions\\PardotV4",
      "Solspace\\Freeform\\Integrations\\CRM\\Salesforce\\Versions\\SalesforceV58",
      "Solspace\\Freeform\\Integrations\\CRM\\Zoho\\Versions\\ZohoV2",
      "Solspace\\Freeform\\Integrations\\PaymentGateways\\Stripe\\Stripe",
      "Solspace\\Freeform\\Integrations\\SpamBlocking\\Emails\\BlockEmailAddresses",
      "Solspace\\Freeform\\Integrations\\SpamBlocking\\IpAddresses\\BlockIpAddresses",
      "Solspace\\Freeform\\Integrations\\SpamBlocking\\Keywords\\BlockKeywords",
    ].includes(className)
  );
}
