import { Breadcrumb } from "@components/breadcrumbs/breadcrumbs";
import { formSelectors } from "@editor/store/slices/form/form.selectors";
import translate from "@ff-client/utils/translations";
import type React from "react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useResolvedPath } from "react-router-dom";

import { FormSettingsContainer, SectionHeader } from "./settings.editor.styles";
import {
  CodeBlock,
  CodeLabel,
  CopyFeedback,
  Description,
  EmbedContent,
  HelpSection,
  HelpTopic,
} from "./settings.embed.styles";

type CopyStatus = "idle" | "copied" | "failed";

export const FormEmbed: React.FC = () => {
  const { handle, isNew } = useSelector(formSelectors.current);
  const currentPath = useResolvedPath("");
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");
  const embedCode = `{{ freeform.form(${JSON.stringify(handle)}).render() }}`;

  useEffect(() => {
    if (copyStatus !== "copied") {
      return;
    }

    const timeout = window.setTimeout(() => setCopyStatus("idle"), 2000);
    return () => window.clearTimeout(timeout);
  }, [copyStatus]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  };

  return (
    <FormSettingsContainer>
      <Breadcrumb
        id="settings-embed"
        label={translate("Embed Form")}
        url={currentPath.pathname}
      />

      <EmbedContent>
        <SectionHeader>{translate("Embed this Form")}</SectionHeader>
        <Description>
          {translate(
            "Add this code to a Craft Twig template where you want the form to appear.",
          )}
        </Description>

        {isNew ? (
          <Description>
            {translate("Save this form before copying its embed code.")}
          </Description>
        ) : (
          <>
            <CodeLabel>{translate("Twig code")}</CodeLabel>
            <CodeBlock>
              <code>{embedCode}</code>
              <button type="button" className="btn" onClick={onCopy}>
                <i
                  className={
                    copyStatus === "copied"
                      ? "fa-classic fa-check"
                      : "fa-classic fa-copy"
                  }
                  aria-hidden="true"
                />
                {translate(copyStatus === "copied" ? "Copied" : "Copy code")}
              </button>
            </CodeBlock>
            <CopyFeedback role="status" aria-live="polite">
              {copyStatus === "copied"
                ? translate("Copied")
                : copyStatus === "failed"
                  ? translate(
                      "Could not copy automatically. Select and copy the code above.",
                    )
                  : null}
            </CopyFeedback>
          </>
        )}

        <HelpSection>
          <h2>{translate("Helpful to Know")}</h2>
          <dl>
            <HelpTopic>
              <dt>{translate("Appearance")}</dt>
              <dd>
                {translate(
                  "This code uses the Formatting Template selected in Settings → General.",
                )}
              </dd>
            </HelpTopic>

            <HelpTopic>
              <dt>{translate("Custom Styling")}</dt>
              <dd>
                {translate(
                  "Customize one placement without changing the form's default appearance using the Template Overrides feature.",
                )}{" "}
                <a
                  href="https://docs.solspace.com/craft/freeform/v5/templates/formatting/#template-overrides"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {translate("View Documentation")}
                </a>
              </dd>
            </HelpTopic>

            <HelpTopic>
              <dt>{translate("Using a Form Field?")}</dt>
              <dd>
                {translate(
                  "If this form is attached to an entry, you can render it through the Freeform Form field type instead.",
                )}{" "}
                <a
                  href="https://docs.solspace.com/craft/freeform/v5/forms/fieldtype/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {translate("View Documentation")}
                </a>
              </dd>
            </HelpTopic>

            <HelpTopic>
              <dt>{translate("Caching the Page?")}</dt>
              <dd>
                {translate("Keep the form dynamic when caching the page.")}{" "}
                <a
                  href="https://docs.solspace.com/craft/freeform/v5/templates/caching/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {translate("View Guide")}
                </a>
              </dd>
            </HelpTopic>
          </dl>
        </HelpSection>

        <HelpSection>
          <h2>{translate("Common Next Steps")}</h2>
          <dl>
            <HelpTopic>
              <dt>{translate("Create a Custom Formatting Template")}</dt>
              <dd>
                {translate(
                  "Start with a sample template, then tailor the form's layout and styles.",
                )}{" "}
                <a
                  href="https://docs.solspace.com/craft/freeform/v5/guides/guide/custom-formatting-templates/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {translate("View Guide")}
                </a>
              </dd>
            </HelpTopic>

            <HelpTopic>
              <dt>{translate("Pass Dynamic Data to this Form")}</dt>
              <dd>
                {translate(
                  "Use Template Overrides to prefill fields or select options from your Twig template.",
                )}{" "}
                <a
                  href="https://docs.solspace.com/craft/freeform/v5/guides/guide/passing-dynamic-data-to-forms/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {translate("View Guide")}
                </a>
              </dd>
            </HelpTopic>

            <HelpTopic>
              <dt>{translate("Choose a Success Behavior")}</dt>
              <dd>
                {translate(
                  "Show a message or redirect visitors after a successful submission.",
                )}{" "}
                <a
                  href="https://docs.solspace.com/craft/freeform/v5/guides/guide/success-return-on-forms/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {translate("View Guide")}
                </a>
              </dd>
            </HelpTopic>

            <HelpTopic>
              <dt>{translate("Protect Against Spam")}</dt>
              <dd>
                {translate(
                  "Review available spam controls and choose the ones that fit your site.",
                )}{" "}
                <a
                  href="https://docs.solspace.com/craft/freeform/v5/guides/guide/spam-protection/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {translate("View Guide")}
                </a>
              </dd>
            </HelpTopic>
          </dl>
        </HelpSection>

        <HelpSection>
          <h2>{translate("Troubleshooting Form Issues")}</h2>
          <Description>
            {translate(
              "Quick troubleshooting the most commonly reported issues with your form's appearance, behavior, or submission of the form on the front end.",
            )}
          </Description>
          <a
            href="https://docs.solspace.com/craft/freeform/v5/guides/guide/troubleshooting-form-issues/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {translate("View Troubleshooting Guide")}
          </a>
        </HelpSection>
      </EmbedContent>
    </FormSettingsContainer>
  );
};
