import translate from "@ff-client/utils/translations";
import {
  type RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import styled from "styled-components";
import { WizardIcon } from "./wizard.icon";

type Point = { x: number; y: number };

export function previewNoticePosition(
  point: Point,
  dialog: Pick<DOMRect, "left" | "right" | "top" | "bottom">,
  width: number,
  height: number,
  notice: { width: number; height: number },
): Point {
  const clamp = (value: number, max: number) =>
    Math.max(12, Math.min(value, max));
  let x = point.x + 16;
  let y = point.y + 16;
  // Keep the message beside the wizard whenever there is room there.
  if (point.x < dialog.left && dialog.left >= notice.width + 28)
    x = Math.min(x, dialog.left - notice.width - 16);
  else if (point.x > dialog.right && width - dialog.right >= notice.width + 28)
    x = Math.max(x, dialog.right + 16);
  else if (point.y < dialog.top && dialog.top >= notice.height + 28)
    y = Math.min(y, dialog.top - notice.height - 16);
  else if (
    point.y > dialog.bottom &&
    height - dialog.bottom >= notice.height + 28
  )
    y = Math.max(y, dialog.bottom + 16);
  return {
    x: clamp(x, width - notice.width - 12),
    y: clamp(y, height - notice.height - 12),
  };
}

const Layer = styled.div`
  position: fixed; inset: 0; z-index: 2; pointer-events: none;
  .wizard-preview-ripple { position: absolute; width: 28px; height: 28px; margin: -14px; border-radius: 50%; background: #71a5d52b; box-shadow: 0 0 0 1px #70a3d36b; animation: wizard-preview-ripple .7s ease-out both; }
  .wizard-preview-notice { position: absolute; box-sizing: border-box; width: 288px; max-width: calc(100vw - 24px); padding: 16px; border: 1px solid #e5dfd1; border-radius: 10px; background: #fffdf8; color: #415366; box-shadow: 0 8px 28px #273b5326; animation: wizard-preview-notice-in .25s ease-out both, wizard-preview-notice-out .3s 5.7s ease-in forwards; }
  .wizard-preview-notice strong { display: flex; align-items: center; gap: 8px; font-size: 13px; line-height: 1.4; }
  .wizard-preview-notice svg { flex: none; width: 18px; height: 18px; color: #5d86ae; }
  .wizard-preview-notice p { margin: 7px 0 0; font-size: 12px; line-height: 1.5; }
  @keyframes wizard-preview-ripple { from { opacity: 1; transform: scale(.5); } to { opacity: 0; transform: scale(3.5); } }
  @keyframes wizard-preview-notice-in { from { opacity: 0; transform: translateY(5px) scale(.98); } to { opacity: 1; transform: none; } }
  @keyframes wizard-preview-notice-out { from { opacity: 1; } to { opacity: 0; } }
  @media (prefers-reduced-motion: reduce) { .wizard-preview-ripple { display: none; } .wizard-preview-notice { animation: none; } }
`;

export function WizardPreviewNotice({
  dialog,
  enabled,
}: {
  dialog: RefObject<HTMLDivElement | null>;
  enabled: boolean;
}) {
  const [notice, setNotice] = useState<(Point & { sequence: number }) | null>(
    null,
  );
  const [position, setPosition] = useState<Point>({ x: 12, y: 12 });
  const sequence = useRef(0);
  const card = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!enabled) {
      setNotice(null);
      return;
    }
    const surface = dialog.current?.parentElement;
    if (!surface) return;
    const dismiss = () => setNotice(null);
    const explain = (event: PointerEvent) => {
      if (event.button !== 0 || !(event.target instanceof Element)) return;
      if (
        dialog.current?.contains(event.target) ||
        event.target.closest(
          '[role="dialog"], [role="menu"], [role="listbox"], .dropdown-rollout',
        )
      ) {
        dismiss();
        return;
      }
      setNotice({
        x: event.clientX,
        y: event.clientY,
        sequence: ++sequence.current,
      });
    };
    surface.addEventListener("pointerdown", explain);
    window.addEventListener("resize", dismiss);
    return () => {
      surface.removeEventListener("pointerdown", explain);
      window.removeEventListener("resize", dismiss);
    };
  }, [dialog, enabled]);
  useLayoutEffect(() => {
    const rect = dialog.current?.getBoundingClientRect();
    if (!notice || !rect) return;
    setPosition(
      previewNoticePosition(
        notice,
        rect,
        window.innerWidth,
        window.innerHeight,
        {
          width: card.current?.offsetWidth || 288,
          height: card.current?.offsetHeight || 142,
        },
      ),
    );
  }, [dialog, notice]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 6000);
    return () => clearTimeout(timer);
  }, [notice]);
  if (!enabled) return null;
  return (
    <Layer role="status" aria-live="polite" aria-atomic="true">
      {notice && (
        <div key={notice.sequence}>
          <span
            className="wizard-preview-ripple"
            style={{ left: notice.x, top: notice.y }}
            aria-hidden="true"
          />
          <div
            ref={card}
            className="wizard-preview-notice"
            style={{ left: position.x, top: position.y }}
          >
            <strong>
              <WizardIcon kind="wizard" />
              {translate("Just a preview for now")}
            </strong>
            <p>
              {translate(
                "This is a preview of the builder. Complete guided setup, then choose Create form on the final step to use the full builder.",
              )}
            </p>
          </div>
        </div>
      )}
    </Layer>
  );
}
