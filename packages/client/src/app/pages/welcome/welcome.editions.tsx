import { Edition } from "@config/freeform/freeform.config";
import translate from "@ff-client/utils/translations";
import type { RefObject } from "react";

// Keep this summary aligned with https://docs.solspace.com/craft/freeform/v5/#pricing.
const editions = [
  { id: Edition.Express, name: "Express", price: 0, renewal: 0 },
  { id: Edition.Lite, name: "Lite", price: 99, renewal: 49 },
  { id: Edition.Pro, name: "Pro", price: 149, renewal: 79 },
];

const features: {
  label: string;
  values: [boolean | string, boolean | string, boolean | string];
}[] = [
  { label: "Forms", values: ["1", "Unlimited", "Unlimited"] },
  { label: "Fields per form", values: ["20", "Unlimited", "Unlimited"] },
  { label: "Email notifications", values: [true, true, true] },
  {
    label: "Submission storage, editing, and export",
    values: [true, true, true],
  },
  { label: "Spam protection and spam folder", values: [true, true, true] },
  { label: "Multi-page forms", values: [false, true, true] },
  { label: "Export profiles and GraphQL", values: [false, true, true] },
  { label: "Email failure alerts and digests", values: [false, true, true] },
  {
    label: "Advanced fields and field encryption",
    values: [false, false, true],
  },
  {
    label: "Conditional rules and Save & Continue",
    values: [false, false, true],
  },
  { label: "A/B Testing and Surveys & Polls", values: [false, false, true] },
  {
    label: "PDF templates and front-end editing",
    values: [false, false, true],
  },
  { label: "Site-aware forms and translations", values: [false, false, true] },
  { label: "CRM, email marketing, and payments", values: [false, false, true] },
  {
    label: "AI form creation, fields, and spam analysis",
    values: [false, false, true],
  },
  { label: "SolspaceAI starter credits", values: [false, false, "1,000"] },
  { label: "Form Monitor and Queue Pinging", values: [false, false, true] },
];

const Coverage = ({ value }: { value: boolean | string }) => {
  if (typeof value === "string") return <>{translate(value)}</>;
  return value ? (
    <svg
      className="edition-check"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={translate("Included")}
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  ) : (
    <span
      className="edition-unavailable"
      role="img"
      aria-label={translate("Not included")}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M8 12h8" />
      </svg>
    </span>
  );
};

type Props = {
  edition: Edition;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onBack: () => void;
};

export const EditionComparison = ({ edition, headingRef, onBack }: Props) => (
  <section
    className="welcome-comparison welcome-view"
    aria-labelledby="edition-comparison-title"
  >
    <div className="edition-toolbar">
      <button type="button" className="edition-back" onClick={onBack}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m14 6-6 6 6 6" />
        </svg>
        {translate("Back to welcome")}
      </button>
      <a
        href="https://docs.solspace.com/craft/freeform/v5/guides/compare-editions/"
        target="_blank"
        rel="noreferrer"
      >
        {translate("Full comparison")}
      </a>
    </div>
    <header className="edition-heading">
      <h2 id="edition-comparison-title" tabIndex={-1} ref={headingRef}>
        {translate("Compare editions")}
      </h2>
      <p>{translate("Find the right fit for your forms.")}</p>
    </header>
    <section
      className="edition-table-scroll"
      aria-label={translate("Edition features")}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard users need to scroll the comparison table.
      tabIndex={0}
    >
      <table className="edition-table">
        <thead>
          <tr>
            <td />
            {editions.map((plan) => (
              <th
                scope="col"
                key={plan.id}
                className={
                  plan.id === edition ? "edition-current-column" : undefined
                }
              >
                <span
                  className="edition-current"
                  aria-hidden={plan.id !== edition}
                >
                  {plan.id === edition
                    ? translate("Current edition")
                    : "\u00a0"}
                </span>
                <span className="edition-name">{plan.name}</span>
                <span className="edition-price">
                  {plan.price ? `$${plan.price}` : translate("Free")}
                </span>
                <span className="edition-price-unit">
                  {translate(plan.price ? "One-time purchase" : "Free forever")}
                </span>
                <span className="edition-renewal">
                  {plan.renewal
                    ? translate("Optional renewal: {price}/year", {
                        price: `$${plan.renewal}`,
                      })
                    : "\u00a0"}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {features.map((feature) => (
            <tr key={feature.label}>
              <th scope="row">{translate(feature.label)}</th>
              {feature.values.map((value, index) => (
                <td
                  key={editions[index].id}
                  className={
                    editions[index].id === edition
                      ? "edition-current-column"
                      : undefined
                  }
                >
                  <Coverage value={value} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
    <footer className="edition-footer">
      <div>
        <p>
          {translate(
            "Prices in USD. Paid editions include one year of updates and support. Renewals are optional.",
          )}
        </p>
        <p>
          {translate(
            "Form Monitor requires an active Pro license. AI services may have additional costs.",
          )}
        </p>
      </div>
      <a
        className="btn"
        href="https://plugins.craftcms.com/freeform"
        target="_blank"
        rel="noreferrer"
      >
        {translate("View in Plugin Store")}
      </a>
    </footer>
  </section>
);
