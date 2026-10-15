import { Breadcrumb } from "@components/breadcrumbs/breadcrumbs";
import { Dropdown } from "@components/elements/custom-dropdown/dropdown";
import { addSelectOptionIcons } from "@components/form-controls/control-types/select/select-option-icons";
import config from "@config/freeform/freeform.config";
import { formSelectors } from "@editor/store/slices/form/form.selectors";
import { useSiteContext } from "@ff-client/contexts/site/site.context";
import {
  useQueryFormSettings,
  useQueryPreviewTemplates,
} from "@ff-client/queries/forms";
import translate from "@ff-client/utils/translations";
import axios from "axios";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useResolvedPath } from "react-router-dom";
import { FieldComponent } from "../form-settings/field-component";
import { type PreviewValues, readPreviewMessage } from "./preview.messages";
import {
  Frame,
  FrameArea,
  PreviewSidebar,
  PreviewWrapper,
  Toolbar,
} from "./preview.styles";
import { ViewportIcon } from "./viewport-icon";

type PreviewData = {
  html: string;
  pages: string[];
  available: boolean;
  page: number;
  channel: string;
  complete: boolean;
};

export const FormPreview: React.FC = () => {
  const form = useSelector(formSelectors.current);
  const formErrors = useSelector(formSelectors.errors);
  const { current } = useSiteContext();
  const { data: settings } = useQueryFormSettings();
  const { data: samples, isLoading: samplesLoading } = useQueryPreviewTemplates(
    form.isNew ? undefined : form.id,
  );
  const path = useResolvedPath("");
  const [width, setWidth] = useState("100%");
  const [availableWidth, setAvailableWidth] = useState(0);
  const frameArea = useRef<HTMLDivElement>(null);
  const scale =
    width.endsWith("px") && availableWidth > 0
      ? Math.min(1, availableWidth / (Number.parseFloat(width) + 2))
      : 1;
  const [template, setTemplate] = useState("");
  const [request, setRequest] = useState({
    page: 0,
    advance: false,
    revision: 0,
  });
  const frame = useRef<HTMLIFrameElement>(null);
  const values = useRef<PreviewValues>(Object.create(null));
  const history = useRef<number[]>([]);
  const active = useRef({ channel: "", page: 0, loading: false });
  const identity = useRef("");
  const [complete, setComplete] = useState(false);
  const [preview, setPreview] = useState<PreviewData>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!frameArea.current || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) =>
      setAvailableWidth(entry.contentRect.width),
    );
    observer.observe(frameArea.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const receive = (event: MessageEvent): void => {
      const message = readPreviewMessage(
        event,
        frame.current?.contentWindow,
        active.current.channel,
      );
      if (!message) return;
      Object.assign(values.current, message.values);
      if (message.action === "values" || active.current.loading) return;
      const back = message.action === "back";
      const page = back
        ? (history.current.pop() ?? Math.max(0, active.current.page - 1))
        : active.current.page;
      setRequest((previous) => ({
        page,
        advance: !back,
        revision: previous.revision + 1,
      }));
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);

  useEffect(() => {
    if (form.isNew || !form.id) return;
    const nextIdentity = `${form.id}:${current?.handle}`;
    const changed = identity.current !== nextIdentity;
    if (changed) {
      setTemplate("");
      setRequest((previous) =>
        previous.page || previous.advance
          ? { page: 0, advance: false, revision: previous.revision + 1 }
          : previous,
      );
      values.current = Object.create(null);
      history.current = [];
      active.current.page = 0;
      setPreview(undefined);
      identity.current = nextIdentity;
    }
    const controller = new AbortController();
    active.current.loading = true;
    active.current.channel = "";
    setLoading(true);
    setComplete(false);
    setError("");
    axios
      .post<PreviewData>(
        `/api/forms/${form.id}/preview`,
        {
          page: changed ? 0 : request.page,
          advance: !changed && request.advance,
          values: values.current,
          templateOverride: changed ? null : template || null,
        },
        {
          params: { site: current?.handle, revision: request.revision },
          signal: controller.signal,
        },
      )
      .then(({ data }) => {
        if (controller.signal.aborted) return;
        if (data.complete) {
          setComplete(true);
          return;
        }
        if (!changed && request.advance && data.page !== active.current.page)
          history.current.push(active.current.page);
        active.current.channel = data.channel;
        active.current.page = data.page ?? request.page;
        setPreview(data);
      })
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
        if (!controller.signal.aborted) {
          active.current.loading = false;
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [form.id, form.isNew, current?.handle, request, template]);

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
            {translate("Formatting Template")}
            <p>
              {translate(
                "Try a sample template without changing the form's saved formatting template.",
              )}
            </p>
            <Dropdown
              value={template}
              loading={loading || samplesLoading}
              showSelectedIcon
              onChange={(value) => {
                history.current = [];
                setTemplate(value);
                setRequest((previous) => ({
                  page: 0,
                  advance: false,
                  revision: previous.revision + 1,
                }));
              }}
              options={addSelectOptionIcons("formattingTemplate", [
                { value: "", label: translate("Use Saved Template") },
                { label: "Solspace", children: samples ?? [] },
              ])}
            />
          </label>
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
                  value: "1440px",
                  label: `${translate("Wide Desktop")} (1440px)`,
                  icon: <ViewportIcon device="desktop" />,
                },
                {
                  value: "1280px",
                  label: `${translate("Laptop")} (1280px)`,
                  icon: <ViewportIcon device="laptop" />,
                },
                {
                  value: "1024px",
                  label: `${translate("Tablet Landscape")} (1024px)`,
                  icon: <ViewportIcon device="tablet-landscape" />,
                },
                {
                  value: "768px",
                  label: `${translate("Tablet")} (768px)`,
                  icon: <ViewportIcon device="tablet" />,
                },
                {
                  value: "430px",
                  label: `${translate("Large Mobile")} (430px)`,
                  icon: <ViewportIcon device="mobile" />,
                },
                {
                  value: "375px",
                  label: `${translate("Mobile")} (375px)`,
                  icon: <ViewportIcon device="mobile" />,
                },
                {
                  value: "320px",
                  label: `${translate("Small Mobile")} (320px)`,
                  icon: <ViewportIcon device="mobile" />,
                },
              ]}
            />
          </label>
          {(preview?.pages.length ?? 0) > 1 && (
            <label>
              {translate("Page")}
              <Dropdown
                value={String(preview.page ?? request.page)}
                onChange={(value) => {
                  history.current = [];
                  setRequest((previous) => ({
                    page: Number(value),
                    advance: false,
                    revision: previous.revision + 1,
                  }));
                }}
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
            onClick={() =>
              setRequest((previous) => ({
                page: active.current.page,
                advance: false,
                revision: previous.revision + 1,
              }))
            }
          >
            {translate(loading ? "Loading" : "Refresh Preview")}
          </button>
        </Toolbar>
        {complete && (
          <p role="status">
            {translate("Preview complete. No submission was sent.")}
          </p>
        )}
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
      <FrameArea ref={frameArea} aria-busy={loading}>
        {preview && (
          <Frame
            ref={frame}
            key={preview.channel}
            title={translate("Form Preview")}
            sandbox="allow-scripts"
            referrerPolicy="no-referrer"
            srcDoc={preview.html}
            style={{
              width: width === "100%" ? "calc(100% - 2px)" : width,
              height: `calc(${100 / scale}% - 2px)`,
              transform: scale < 1 ? `scale(${scale})` : undefined,
              transformOrigin: "top center",
              pointerEvents: loading ? "none" : undefined,
            }}
          />
        )}
      </FrameArea>
    </PreviewWrapper>
  );
};
