import { Breadcrumb } from "@components/breadcrumbs/breadcrumbs";
import { Dropdown } from "@components/elements/custom-dropdown/dropdown";
import config from "@config/freeform/freeform.config";
import { formSelectors } from "@editor/store/slices/form/form.selectors";
import { useSiteContext } from "@ff-client/contexts/site/site.context";
import { useQueryFormSettings } from "@ff-client/queries/forms";
import translate from "@ff-client/utils/translations";
import axios from "axios";
import type React from "react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useResolvedPath } from "react-router-dom";
import { FieldComponent } from "../form-settings/field-component";
import {
  Frame,
  FrameArea,
  PreviewSidebar,
  PreviewWrapper,
  Toolbar,
} from "./preview.styles";
import { ViewportIcon } from "./viewport-icon";

type PreviewData = { html: string; pages: string[]; available: boolean };

export const FormPreview: React.FC = () => {
  const form = useSelector(formSelectors.current);
  const formErrors = useSelector(formSelectors.errors);
  const { current } = useSiteContext();
  const { data: settings } = useQueryFormSettings();
  const path = useResolvedPath("");
  const [width, setWidth] = useState("100%");
  const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0);
  const [preview, setPreview] = useState<PreviewData>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (form.isNew || !form.id) return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    axios
      .post<PreviewData>(
        `/api/forms/${form.id}/preview`,
        { page },
        {
          params: { site: current?.handle, revision },
          signal: controller.signal,
        },
      )
      .then(({ data }) => setPreview(data))
      .catch(() => {
        if (controller.signal.aborted) return;
        setPreview(undefined);
        setError(
          translate(
            "Could not load the preview. Check the formatting template and preview asset URLs, then save and refresh.",
          ),
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [form.id, form.isNew, current?.handle, page, revision]);

  const properties = settings?.find(
    (item) => item.handle === "general",
  )?.properties;
  const assetErrors = Boolean(
    formErrors?.general?.previewCssUrls?.length ||
      formErrors?.general?.previewJsUrls?.length,
  );

  return (
    <PreviewWrapper>
      <Breadcrumb
        id="preview"
        label={translate("Preview")}
        url={path.pathname}
      />
      <PreviewSidebar>
        <h2>{translate("Preview")}</h2>
        <p>
          {translate(
            "Preview shows the saved form. Save changes, then refresh. Submissions, payments, uploads, and external data requests are disabled.",
          )}
        </p>
        <Toolbar>
          <label>
            {translate("Viewport")}
            <Dropdown
              value={width}
              onChange={setWidth}
              showSelectedIcon
              options={[
                {
                  value: "100%",
                  label: translate("Desktop"),
                  icon: <ViewportIcon device="desktop" />,
                },
                {
                  value: "768px",
                  label: translate("Tablet"),
                  icon: <ViewportIcon device="tablet" />,
                },
                {
                  value: "375px",
                  label: translate("Mobile"),
                  icon: <ViewportIcon device="mobile" />,
                },
              ]}
            />
          </label>
          {(preview?.pages.length ?? 0) > 1 && (
            <label>
              {translate("Page")}
              <Dropdown
                value={String(page)}
                onChange={(value) => setPage(Number(value))}
                options={preview.pages.map((label, index) => ({
                  value: String(index),
                  label: label || `${translate("Page")} ${index + 1}`,
                }))}
              />
            </label>
          )}
          <button
            type="button"
            className="btn"
            disabled={loading || form.isNew}
            onClick={() => setRevision((value) => value + 1)}
          >
            {translate(loading ? "Loading" : "Refresh Preview")}
          </button>
        </Toolbar>
        {form.isNew && (
          <p role="status">
            {translate("Save this form before previewing it.")}
          </p>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {preview?.available === false && (
          <p role="status">
            {translate(
              "This form is currently unavailable. Preview ignores schedules and submission limits.",
            )}
          </p>
        )}
        {config.metadata.freeform.canManageHtmlEmbeds && properties && (
          <details open={assetErrors ? true : undefined}>
            <summary>{translate("Additional Preview Assets")}</summary>
            <p>
              {translate(
                "Optional CSS and JavaScript files normally loaded by your site layout. Sample templates already include their framework assets.",
              )}
            </p>
            <p>
              {translate(
                "Use direct file URLs, not a webpage URL. These assets affect only Preview. Save the form, then refresh to apply changes.",
              )}
            </p>
            {properties
              .filter((property) =>
                ["previewCssUrls", "previewJsUrls"].includes(property.handle),
              )
              .map((property) => (
                <FieldComponent
                  key={property.handle}
                  namespace="general"
                  property={property}
                />
              ))}
            <p>
              {translate(
                "External assets must allow anonymous cross-origin requests (CORS).",
              )}
            </p>
          </details>
        )}
      </PreviewSidebar>
      <FrameArea aria-busy={loading}>
        {preview && (
          <Frame
            key={`${page}-${revision}`}
            title={translate("Form Preview")}
            sandbox="allow-scripts"
            referrerPolicy="no-referrer"
            srcDoc={preview.html}
            style={{ width }}
          />
        )}
      </FrameArea>
    </PreviewWrapper>
  );
};
