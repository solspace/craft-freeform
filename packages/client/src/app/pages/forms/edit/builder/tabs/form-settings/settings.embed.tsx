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
  DocsLink,
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
        <SectionHeader>{translate("Embed this form")}</SectionHeader>
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
          <h2>{translate("Helpful to know")}</h2>
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
              <dt>{translate("Custom styling")}</dt>
              <dd>
                {translate(
                  "Customize one placement without changing the form's default appearance.",
                )}{" "}
                <a
                  href="https://docs.solspace.com/craft/freeform/v5/templates/formatting/#template-overrides"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {translate("Template Overrides")}
                </a>
              </dd>
            </HelpTopic>

            <HelpTopic>
              <dt>{translate("Using a Form field?")}</dt>
              <dd>
                {translate(
                  "If this form is attached to an entry, you can render it through that field instead.",
                )}{" "}
                <a
                  href="https://docs.solspace.com/craft/freeform/v5/forms/fieldtype/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {translate("Freeform Form field")}
                </a>
              </dd>
            </HelpTopic>

            <HelpTopic>
              <dt>{translate("Caching the page?")}</dt>
              <dd>
                {translate("Keep the form dynamic when caching the page.")}{" "}
                <a
                  href="https://docs.solspace.com/craft/freeform/v5/templates/caching/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {translate("Form caching guide")}
                </a>
              </dd>
            </HelpTopic>
          </dl>
        </HelpSection>

        <HelpSection>
          <h2>{translate("Common next steps")}</h2>
          <dl>
            <HelpTopic>
              <dt>{translate("Create a custom formatting template")}</dt>
              <dd>
                {translate(
                  "Start with a sample template, then tailor the form's layout and styles.",
                )}{" "}
                <a
                  href="https://docs.solspace.com/craft/freeform/v5/guides/guide/custom-formatting-templates/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {translate("Custom formatting template guide")}
                </a>
              </dd>
            </HelpTopic>

            <HelpTopic>
              <dt>{translate("Pass dynamic data to this form")}</dt>
              <dd>
                {translate(
                  "Use Template Overrides to prefill fields or select options from your Twig template.",
                )}{" "}
                <a
                  href="https://docs.solspace.com/craft/freeform/v5/guides/guide/passing-dynamic-data-to-forms/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {translate("Passing dynamic data guide")}
                </a>
              </dd>
            </HelpTopic>

            <HelpTopic>
              <dt>{translate("Choose a success behavior")}</dt>
              <dd>
                {translate(
                  "Show a message or redirect visitors after a successful submission.",
                )}{" "}
                <a
                  href="https://docs.solspace.com/craft/freeform/v5/guides/guide/success-return-on-forms/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {translate("Success return guide")}
                </a>
              </dd>
            </HelpTopic>

            <HelpTopic>
              <dt>{translate("Improve spam protection")}</dt>
              <dd>
                {translate(
                  "Review available spam controls and choose the ones that fit your site.",
                )}{" "}
                <a
                  href="https://docs.solspace.com/craft/freeform/v5/guides/guide/spam-protection/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {translate("Spam protection guide")}
                </a>
              </dd>
            </HelpTopic>
          </dl>
        </HelpSection>

        <DocsLink
          href="https://docs.solspace.com/craft/freeform/v5/templates/queries/form/"
          target="_blank"
          rel="noopener noreferrer"
        >
          {translate("More examples of rendering forms in Twig")}
        </DocsLink>

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
            {translate("Troubleshooting guide")}
          </a>
        </HelpSection>
      </EmbedContent>
    </FormSettingsContainer>
  );
};
