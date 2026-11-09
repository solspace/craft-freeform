import translate from "@ff-client/utils/translations";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import solspaceAiIcon from "../../../../../plugin/src/Integrations/AI/SolspaceAI/icon.svg";
import analyzeIllustration from "../../../../../plugin/src/Resources/icons/service-introduction/analyze.svg?raw";
import generateIllustration from "../../../../../plugin/src/Resources/icons/service-introduction/generate.svg?raw";
import spamIllustration from "../../../../../plugin/src/Resources/icons/service-introduction/spam.svg?raw";

import "../../../../../styles/src/cp/service-introduction/service-introduction.css";

const Feature = ({
  kind,
  title,
  children,
  example,
}: {
  kind: "form" | "text" | "shield";
  title: string;
  children: ReactNode;
  example: string;
}) => (
  <section className="ff-service-feature">
    <span
      className="ff-service-usecase-illustration"
      aria-hidden="true"
      dangerouslySetInnerHTML={{
        // Trusted local artwork must be inline to inherit Craft's theme variables.
        __html: {
          form: generateIllustration,
          text: analyzeIllustration,
          shield: spamIllustration,
        }[kind],
      }}
    />
    <h3>{title}</h3>
    <span className="ff-service-example">{example}</span>
    <p>{children}</p>
  </section>
);

export const AiIntroduction = () => (
  <div className="ff-service-intro ff-ai-intro">
    <header className="ff-service-hero">
      <div className="ff-service-hero-copy">
        <div className="ff-service-eyebrow">
          <span className="ff-service-brand">
            <img src={solspaceAiIcon} alt="" width="28" height="28" />
            SolspaceAI
          </span>
          <span className="ff-service-offer">
            {translate("1,000 free credits with Freeform Pro")}
          </span>
        </div>
        <h2 className="ff-service-title">
          {translate("Put AI to work in your forms.")}
        </h2>
        <p className="ff-service-lead">
          {translate(
            "Build forms faster, make sense of submissions, and add another layer of spam protection. SolspaceAI brings it all into Freeform, without a separate AI account or API key.",
          )}
        </p>
        <div className="ff-service-actions">
          <Link to="/integrations/ai/SolspaceAIV1" className="btn submit">
            {translate("Set up SolspaceAI")}
          </Link>
          <a
            href="https://docs.solspace.com/craft/freeform/v5/integrations/solspace-ai/"
            className="btn"
            target="_blank"
            rel="noreferrer"
          >
            {translate("Explore the docs")}
          </a>
        </div>
      </div>
    </header>
    <div className="ff-service-features">
      <Feature
        kind="form"
        title={translate("From idea to editable form")}
        example={translate(
          "Try a project enquiry form with a budget and deadline.",
        )}
      >
        {translate(
          "Describe the form you need, or upload a PDF or image as a reference. Review and refine the generated fields in the form builder.",
        )}
      </Feature>
      <Feature
        kind="text"
        title={translate("Turn responses into useful insights")}
        example={translate(
          "Summarize a long message or categorize a support request.",
        )}
      >
        {translate(
          "Use an AI field to summarize, categorize, or analyze selected submission fields with your own instructions.",
        )}
      </Feature>
      <Feature
        kind="shield"
        title={translate("Look beyond the usual spam checks")}
        example={translate(
          "Flag unwanted sales pitches while allowing genuine enquiries.",
        )}
      >
        {translate(
          "Connect SolspaceAI to AI Spam Analysis to evaluate submission content against the rules you choose for each form.",
        )}
      </Feature>
    </div>
    <aside className="ff-service-setup">
      <h3>{translate("Start with the included credits")}</h3>
      <p>
        {translate(
          "Save and authorize the SolspaceAI integration, then choose where to use it. Each Freeform Pro license includes 1,000 starter credits. No credit card is needed to get started.",
        )}
      </p>
      <p>
        {translate(
          "Additional credits come in bundles of various sizes, available as one-time purchases. Purchased credits never expire, and there is no subscription. Review usage and top up here after setup.",
        )}
      </p>
    </aside>
  </div>
);
