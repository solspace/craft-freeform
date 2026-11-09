import "@ff-chart-styles";
import { useModal } from "@components/modals/modal.context";
import type { ModalContainerProps } from "@components/modals/modal.types";
import {
  SlideoutContainer,
  SlideoutHeader,
} from "@components/slideouts/slideout.styles";
import { useSiteContext } from "@ff-client/contexts/site/site.context";
import type { DashboardWidgetSize } from "@ff-client/types/forms";
import translate from "@ff-client/utils/translations";
import CrossIcon from "@ff-icons/actions/delete";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import styled from "styled-components";
import type { DashboardWidget } from "../grid.widgets";
import {
  getExtraWidgetSizes,
  healthWidgetKey,
  widgetKey,
} from "../grid.widgets";
import { CardSizeMenu } from "./card.size-menu";
import { CardWrapper, Title } from "./card.styles";
import { WidgetFrame } from "./card.widget-frame";
import { WidgetTypeMenu } from "./card.widget-menu";

const EditorFrame = styled.iframe`width: 100%; flex: 1; min-height: 0; border: 0; display: block;`;
const WidgetHeader = styled.div`
  display: flex; align-items: center; gap: 12px; padding: 24px 24px 8px;
  min-height: 58px; box-sizing: border-box; flex-shrink: 0;
  h2 { flex: 1; margin: 0; padding: 0; font-size: 20px; }
  button { flex-shrink: 0; }
`;
const HealthContext = styled.span`
  display: flex; align-items: center; gap: 10px; color: var(--light-text-color, #677788);
  font-size: 11px; line-height: 20px; white-space: nowrap;
  .health-scope { color: var(--gray-500, #7b8794); }
`;
const HealthLinks = styled.nav`
  display: flex; align-items: center; gap: 10px; margin-inline-start: auto; flex-shrink: 0;
  a { display: inline-flex; align-items: center; gap: 5px; min-height: 26px; font-size: 11px; font-weight: 500; white-space: nowrap; }
  a:hover { text-decoration: underline; }
  svg { width: 14px; height: 14px; flex: none; }
`;
const WidgetTile = styled(CardWrapper)`
  container-type: inline-size; container-name: dashboard-widget;
  [data-health='true'] h2 { flex: 0 1 auto; min-width: 0; width: auto; }
  @container dashboard-widget (width < 700px) { .health-scope { display: none; } }
  @container dashboard-widget (width < 560px) {
    ${HealthLinks} { gap: 4px; }
    ${HealthLinks} a { width: 26px; justify-content: center; }
    ${HealthLinks} a span { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  }
  @container dashboard-widget (width < 380px) { ${HealthContext} { display: none; } }
  justify-content: flex-start;
  &[data-card-size='3x2'] { grid-column: span 3; grid-row: span 2; }
  &[data-card-size='2x3'] { grid-column: span 2; grid-row: span 3; }
  &[data-card-size='3x3'] { grid-column: span 3; grid-row: span 3; }
  @container form-card-grid (width < 996px) {
    &[data-card-size='3x2'], &[data-card-size='3x3'] { grid-column: span 2; }
  }
  @container form-card-grid (width < 658px) {
    &[data-card-size] { grid-column: span 1; }
  }
`;

export const WidgetEditor = ({
  data,
  closeModal,
}: ModalContainerProps<{ type?: string; uid?: string; siteId: number }>) => {
  const frame = useRef<HTMLIFrameElement>(null);
  const client = useQueryClient();
  const { current } = useSiteContext();
  useEffect(() => {
    const listener = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== frame.current?.contentWindow ||
        event.data?.type !== "freeform-widget-saved"
      )
        return;
      const uid = event.data.uid;
      void client
        .invalidateQueries({ queryKey: widgetKey(data.siteId) })
        .then(() => {
          if (typeof uid !== "string" || !/^[a-f0-9-]+$/.test(uid)) return;
          requestAnimationFrame(() => {
            const card = document.querySelector<HTMLElement>(
              `[data-id="widget-${uid}"]`,
            );
            card?.focus({ preventScroll: true });
            card?.scrollIntoView({ block: "nearest" });
          });
        });
      closeModal();
    };
    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, [data.siteId, client, closeModal]);
  useEffect(() => {
    if (current?.id !== data.siteId) closeModal();
  }, [current?.id, data.siteId, closeModal]);
  const params = new URLSearchParams({
    siteId: String(data.siteId),
    ...(data.uid ? { uid: data.uid } : { type: data.type }),
  });
  return (
    <SlideoutContainer>
      <SlideoutHeader>
        <h1>{translate("Widget settings")}</h1>
        <button
          type="button"
          className="btn header-btn"
          aria-label={translate("Close")}
          onClick={closeModal}
        >
          <CrossIcon />
        </button>
      </SlideoutHeader>
      <EditorFrame
        data-freeform-widget-frame
        ref={frame}
        title={translate("Widget settings")}
        src={Craft.getCpUrl(`freeform/api/forms/widgets/editor?${params}`)}
      />
    </SlideoutContainer>
  );
};

export const InsertWidgetMenu = () => {
  const { openSlideout } = useModal();
  const { current } = useSiteContext();
  return (
    <WidgetTypeMenu
      onSelect={(type) =>
        openSlideout(
          WidgetEditor,
          { type, siteId: current.id },
          translate("Insert widget"),
        )
      }
    />
  );
};

export const WidgetCard = ({
  widget,
  siteId,
  disabled,
  onResize,
  onRemove,
  onKeyboardMove,
  onHealthReady,
}: {
  widget: DashboardWidget;
  siteId: number;
  disabled: boolean;
  onResize: (size: DashboardWidgetSize) => void;
  onRemove: () => void;
  onKeyboardMove: (id: string, key: string) => void;
  onHealthReady?: (key: string, ready: boolean) => void;
}) => {
  const { openSlideout } = useModal();
  const key = healthWidgetKey(widget, siteId);
  const reportHealthReady = useCallback(
    (ready: boolean) => onHealthReady?.(key, ready),
    [onHealthReady, key],
  );
  return (
    <WidgetTile
      data-id={`widget-${widget.uid}`}
      data-card-size={widget.size}
      aria-label={widget.title}
      tabIndex={0}
      aria-describedby="form-card-move-help"
      onKeyDown={(event) => {
        if (
          event.target === event.currentTarget &&
          event.altKey &&
          ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
            event.key,
          ) &&
          !disabled
        ) {
          event.preventDefault();
          onKeyboardMove(`widget-${widget.uid}`, event.key);
        }
      }}
    >
      <WidgetHeader data-health={widget.type === "activity-health"}>
        <Title title={widget.title}>{widget.title}</Title>
        {widget.navigation && (
          <>
            <HealthContext
              title={`${widget.navigation.period}, ${widget.navigation.scope}`}
            >
              <span>{widget.navigation.period}</span>
              <span className="health-scope">{widget.navigation.scope}</span>
            </HealthContext>
            <HealthLinks aria-label={translate("Review logs")}>
              {widget.navigation.links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  title={`${link.label} (${widget.navigation.period})`}
                >
                  <span>{link.label}</span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M7 17 17 7M7 7h10v10" />
                  </svg>
                </a>
              ))}
            </HealthLinks>
          </>
        )}
        <CardSizeMenu
          name={widget.title}
          size={widget.size}
          disabled={disabled}
          onChange={onResize}
          extraSizes={getExtraWidgetSizes(widget.type).map((choice) => ({
            ...choice,
            onSelect: () => onResize(choice.size),
          }))}
          onRemoveWidget={onRemove}
          onEditWidget={() =>
            openSlideout(
              WidgetEditor,
              { uid: widget.uid, siteId },
              translate("Widget settings"),
            )
          }
        />
      </WidgetHeader>
      <WidgetFrame
        key={`${widget.uid}-${siteId}-${widget.revision}`}
        title={widget.title}
        onHealthReady={
          widget.type === "activity-health" ? reportHealthReady : undefined
        }
        src={Craft.getCpUrl(
          `freeform/api/forms/widgets/${widget.uid}/body?siteId=${siteId}`,
        )}
      />
    </WidgetTile>
  );
};
