import { formSelectors } from "@editor/store/slices/form/form.selectors";
import { useSiteContext } from "@ff-client/contexts/site/site.context";
import translate from "@ff-client/utils/translations";
import ExclamationIcon from "@ff-icons/actions/exclamation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { buildBuilderTemplatePreviewDocument } from "./builder-template-preview.document";

const Preview = styled.div`
  width: 100%;
  min-width: 0;
  overflow: hidden;
  iframe { display: block; width: 100%; border: 0; pointer-events: none; }
`;

const Placeholder = styled.div`
  min-height: 70px;
  padding: 14px 16px;
  border: 1px dashed #cbd5e1;
  border-radius: 4px;
  color: #526274;
  overflow-wrap: anywhere;
`;

const MissingTemplate = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
  padding: 14px 16px;
  border: 1px solid #e6bf71;
  border-inline-start: 3px solid #d58a16;
  border-radius: 5px;
  background: #fff8e9;
  color: #624716;
  font-size: 13px;
  line-height: 1.5;

  > svg {
    flex: none;
    width: 18px;
    height: 18px;
    margin-top: 1px;
    fill: #b96d08;
  }

  > div { min-width: 0; overflow-wrap: anywhere; }
  strong { display: block; margin-bottom: 2px; }
  code { font-size: 12px; }
  p { margin: 4px 0 0; }
`;

type PreviewResponse = { html: string; error?: string; errorCode?: string };

export const BuilderTemplatePreview: React.FC<{
  fieldUid: string;
  template: string;
}> = ({ fieldUid, template }) => {
  const form = useSelector(formSelectors.current);
  const { current } = useSiteContext();
  const frame = useRef<HTMLIFrameElement>(null);
  const observer = useRef<ResizeObserver | null>(null);
  const [height, setHeight] = useState(70);
  const { data, isPending, isError } = useQuery({
    queryKey: [
      "builder-template-preview",
      form?.id,
      current?.handle,
      fieldUid,
      template,
    ],
    queryFn: ({ signal }) =>
      axios
        .post<PreviewResponse>(
          `/api/forms/${form?.id}/builder-template-preview`,
          { template, fieldUid },
          { params: { site: current?.handle }, signal },
        )
        .then(({ data }) => data),
    enabled: Boolean(form?.id && template),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const html = typeof data?.html === "string" ? data.html : "";
  const srcDoc = useMemo(
    () => (html ? buildBuilderTemplatePreviewDocument(html) : ""),
    [html],
  );

  const resize = useCallback(() => {
    try {
      const document = frame.current?.contentDocument;
      if (!document) return;
      const body = document.body;
      if (!body) return;
      // scrollHeight is at least the iframe viewport height, so it can never
      // shrink a short template after the initial render. Measure the content.
      const range = document.createRange();
      range.selectNodeContents(body);
      const next = Math.ceil(range.getBoundingClientRect().bottom);
      if (next > 0) setHeight(Math.max(1, next));
    } catch {
      // Browsers that isolate srcDoc more strictly keep the frame at its fallback height.
    }
  }, []);

  const onLoad = useCallback(() => {
    observer.current?.disconnect();
    observer.current = null;
    resize();
    try {
      const body = frame.current?.contentDocument?.body;
      if (!body || typeof ResizeObserver === "undefined") return;
      observer.current = new ResizeObserver(resize);
      observer.current.observe(body);
    } catch {
      // The static frame remains visible if this browser forbids size observation.
    }
  }, [resize]);

  useEffect(() => () => observer.current?.disconnect(), []);

  if (!template)
    return <Placeholder>{translate("Choose a Twig file")}</Placeholder>;
  if (!form?.id)
    return (
      <Placeholder>
        {translate("Save the form to preview this template.")}
      </Placeholder>
    );
  if (isPending)
    return (
      <Placeholder role="status">
        {translate("Loading template preview…")}
      </Placeholder>
    );
  if (data?.errorCode === "missing-template")
    return (
      <MissingTemplate role="alert">
        <ExclamationIcon aria-hidden="true" focusable="false" />
        <div>
          <strong>{translate("Template not found")}</strong>
          <code>{template}</code>
          <p>
            {translate(
              "Restore this file in the Builder Templates directory, or choose another template in the field settings.",
            )}
          </p>
        </div>
      </MissingTemplate>
    );
  if (isError || data?.error || !srcDoc)
    return (
      <Placeholder role="status">
        {translate(
          data?.error ||
            "Template preview unavailable. Check the Twig file or try again.",
        )}
      </Placeholder>
    );

  return (
    <Preview>
      <iframe
        ref={frame}
        title={translate("Template preview: {name}", { name: template })}
        sandbox="allow-same-origin"
        srcDoc={srcDoc}
        height={height}
        onLoad={onLoad}
      />
    </Preview>
  );
};
