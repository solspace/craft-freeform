import { Breadcrumb } from "@components/breadcrumbs/breadcrumbs";
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
            <select
              className="text"
              value={width}
              onChange={(event) => setWidth(event.target.value)}
            >
              <option value="100%">{translate("Desktop")}</option>
              <option value="768px">{translate("Tablet")}</option>
              <option value="375px">{translate("Mobile")}</option>
            </select>
          </label>
          {(preview?.pages.length ?? 0) > 1 && (
            <label>
              {translate("Page")}
              <select
                className="text"
                value={page}
                onChange={(event) => setPage(Number(event.target.value))}
              >
                {preview.pages.map((label, index) => (
                  <option key={index} value={index}>
                    {label || `${translate("Page")} ${index + 1}`}
                  </option>
                ))}
              </select>
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
            <summary>{translate("Preview Assets")}</summary>
            <p>
              {translate(
                "Add the styles and scripts normally supplied by your site layout. Use direct asset URLs, not a webpage URL. JavaScript assets must support anonymous CORS requests. These settings affect Preview only.",
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
