export type StarterList = {
  entries: string[];
  description: string;
  key?: (entry: string) => string;
};

const emails: StarterList = {
  description:
    "Starter list: disposable email domains and .ru, .su, .xyz, and .top endings. Review before saving.",
  // Optional examples to review before saving, not a reputation-based spam blocklist.
  entries: [
    "*@mailinator.com",
    "*@guerrillamail.com",
    "*@sharklasers.com",
    "*@yopmail.com",
    "*@maildrop.cc",
    "*@dropmail.me",
    "*@*.dropmail.me",
    "*@10mail.org",
    "*@*.ru",
    "*@*.su",
    "*@*.xyz",
    "*@*.top",
  ],
};
const keywords: StarterList = {
  description:
    "Starter list: 100 English words, phrases, and wildcard patterns. Review for your site before saving.",
  entries: [
    '"buy backlinks"',
    '"buy quality backlinks"',
    '"high quality backlinks"',
    '"cheap backlinks"',
    '"casino backlinks"',
    '"guest post services"',
    '"guest posting services"',
    '"paid guest posts"',
    '"link building services"',
    '"link building packages"',
    '"seo link building"',
    '"seo services offer"',
    '"guaranteed google rankings"',
    '"guaranteed first page rankings"',
    '"rank your website first"',
    '"increase your domain authority"',
    '"boost your domain rating"',
    '"dofollow backlinks"',
    '"pbn links"',
    '"private blog network"',
    '"crypto investment opportunity"',
    '"guaranteed investment returns"',
    '"double your bitcoin"',
    '"double your money"',
    '"guaranteed daily profit"',
    '"risk free investment"',
    '"get rich quick"',
    '"make money fast"',
    '"earn money instantly"',
    '"passive income guaranteed"',
    '"forex trading signals"',
    '"binary options trading"',
    '"recover lost cryptocurrency"',
    '"crypto recovery service"',
    '"claim your crypto reward"',
    '"unclaimed inheritance"',
    '"inheritance transfer"',
    '"advance fee loan"',
    '"no credit check loan"',
    '"instant payday loan"',
    "viagr*",
    "cialis",
    "levitra",
    "kamagra",
    '"buy sildenafil"',
    '"buy tadalafil"',
    '"cheap viagra"',
    '"buy prescription drugs"',
    '"no prescription required"',
    '"online pharmacy"',
    '"pharmacy without prescription"',
    '"buy anabolic steroids"',
    '"steroids for sale"',
    '"miracle weight loss"',
    '"weight loss pills"',
    "porn*",
    "xxx",
    "camgirl*",
    '"adult webcam"',
    '"live sex chat"',
    '"free sex videos"',
    '"sex dating"',
    '"escort services"',
    '"hot singles near you"',
    '"meet local singles"',
    '"russian brides"',
    '"mail order brides"',
    '"adult dating site"',
    '"nude photos"',
    '"erotic massage"',
    '"online casino"',
    '"casino bonus"',
    '"no deposit bonus"',
    '"free casino spins"',
    '"free spins bonus"',
    '"slot machine bonus"',
    '"online slots"',
    '"play slots now"',
    '"sports betting tips"',
    '"betting promo code"',
    '"guaranteed betting wins"',
    '"casino welcome offer"',
    '"jackpot winner"',
    '"lottery prize winner"',
    '"claim your lottery winnings"',
    '"you have won a prize"',
    '"claim your free prize"',
    '"claim your cash reward"',
    '"wire transfer required"',
    '"pay a processing fee"',
    '"urgent business proposal"',
    '"bulk email lists"',
    '"buy email database"',
    '"buy instagram followers"',
    '"buy youtube subscribers"',
    '"buy tiktok followers"',
    '"cheap social media followers"',
    '"fake reviews for sale"',
    '"replica watches"',
    '"counterfeit designer bags"',
  ],
};
const allowed: StarterList = {
  description: "Starter list: common technical terms and abbreviations.",
  key: (entry) => entry.replace(/[^a-z]/gi, "").toLowerCase(),
  entries: [
    "API",
    "SDK",
    "CRM",
    "CMS",
    "ERP",
    "RFP",
    "RFI",
    "RFQ",
    "SaaS",
    "HTML",
    "CSS",
    "HTTP",
    "HTTPS",
    "JSON",
    "XML",
    "SQL",
    "MySQL",
    "PostgreSQL",
    "PHP",
    "JavaScript",
    "TypeScript",
    "GraphQL",
    "OAuth",
    "SSO",
    "SFTP",
    "PDF",
    "CSV",
    "WordPress",
    "GitHub",
    "DevOps",
  ],
};
const parameters: StarterList = {
  description:
    "Starter list: five UTM parameters and five advertising click IDs.",
  key: (entry) => entry.trim(),
  entries: [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "gclid",
    "gbraid",
    "wbraid",
    "fbclid",
    "msclkid",
  ],
};

export function starterList(
  className: string,
  handle: string,
): StarterList | undefined {
  if (
    className ===
      "Solspace\\Freeform\\Integrations\\SpamBlocking\\Emails\\BlockEmailAddresses" &&
    handle === "defaultEmails"
  )
    return emails;
  if (
    className ===
      "Solspace\\Freeform\\Integrations\\SpamBlocking\\Keywords\\BlockKeywords" &&
    handle === "defaultKeywords"
  )
    return keywords;
  if (
    className ===
      "Solspace\\Freeform\\Integrations\\SpamBlocking\\Gibberish\\BlockGibberish" &&
    handle === "defaultAllowedTerms"
  )
    return allowed;
  if (
    className ===
      "Solspace\\Freeform\\Integrations\\Single\\UrlParameterTracking\\UrlParameterTracking" &&
    handle === "defaultParameters"
  )
    return parameters;
  return undefined;
}

/** Append missing entries while keeping the existing text, order, and line endings. */
export function appendStarterEntries(
  current: string,
  preset: StarterList,
): { value: string; added: number } {
  const key = preset.key ?? ((entry: string) => entry.trim().toLowerCase());
  const existing = new Set(
    current.split(/\r?\n/).map((entry) => key(entry.trim())),
  );
  const additions = preset.entries.filter((entry) => {
    const normalized = key(entry);
    if (existing.has(normalized)) return false;
    existing.add(normalized);
    return true;
  });
  if (!additions.length) return { value: current, added: 0 };
  const newline = current.includes("\r\n") ? "\r\n" : "\n";
  const separator = current && !current.endsWith("\n") ? newline : "";
  return {
    value: current + separator + additions.join(newline),
    added: additions.length,
  };
}
