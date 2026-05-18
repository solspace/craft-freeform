import type { FloatingContext } from "@floating-ui/react";
import {
  arrow,
  autoUpdate,
  FloatingArrow,
  FloatingPortal,
  flip,
  offset,
  safePolygon,
  shift,
  useClick,
  useClientPoint,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import type { CSSProperties, ReactNode } from "react";
import { useMemo, useRef, useState } from "react";

import { ReferenceWrapper, Surface, type TooltipTheme } from "./tooltip.styles";

type TooltipPosition = "top" | "bottom" | "left" | "right";
type TooltipTrigger = "mouseenter" | "click";
type Delay = number | [number, number];

export type TooltipProps = {
  animation?: string;
  arrow?: boolean;
  children: ReactNode;
  delay?: Delay;
  distance?: number;
  duration?: number;
  followCursor?: boolean;
  hideOnClick?: boolean;
  html?: ReactNode;
  interactive?: boolean;
  interactiveBorder?: number;
  position?: TooltipPosition;
  size?: string;
  style?: CSSProperties;
  theme?: TooltipTheme;
  title?: ReactNode;
  trigger?: TooltipTrigger;
};

type FloatingContentProps = {
  arrowEnabled: boolean;
  arrowRef: ReturnType<typeof useRef<SVGSVGElement | null>>;
  context: FloatingContext;
  content: ReactNode;
  floatingStyles: CSSProperties;
  getFloatingProps: ReturnType<typeof useInteractions>["getFloatingProps"];
  refs: ReturnType<typeof useFloating>["refs"];
  theme: TooltipTheme;
};

type BaseFloatingProps = TooltipProps & {
  trigger: TooltipTrigger;
};

const delayToObject = (delay?: Delay): { open?: number; close?: number } => {
  if (typeof delay === "number") {
    return { open: delay, close: delay };
  }

  if (Array.isArray(delay)) {
    return { open: delay[0], close: delay[1] };
  }

  return {};
};

const FloatingContent = ({
  arrowEnabled,
  arrowRef,
  context,
  content,
  floatingStyles,
  getFloatingProps,
  refs,
  theme,
}: FloatingContentProps) => {
  return (
    <FloatingPortal>
      <Surface
        ref={refs.setFloating}
        {...getFloatingProps()}
        $theme={theme}
        style={floatingStyles}
      >
        {content}
        {arrowEnabled && (
          <FloatingArrow
            ref={arrowRef}
            context={context}
            fill={theme === "light" ? "#ffffff" : "#2f3c4c"}
            stroke={theme === "light" ? "#d3dae2" : "#2f3c4c"}
            strokeWidth={1}
          />
        )}
      </Surface>
    </FloatingPortal>
  );
};

const BaseFloating = ({
  arrow: arrowEnabled = false,
  children,
  delay,
  distance = 8,
  followCursor = false,
  hideOnClick = true,
  html,
  interactive = false,
  interactiveBorder,
  position = "top",
  style,
  theme = "dark",
  title,
  trigger,
}: BaseFloatingProps) => {
  const [open, setOpen] = useState(false);
  const arrowRef = useRef<SVGSVGElement | null>(null);
  const content = html ?? title;

  const hoverHandleClose = useMemo(
    () =>
      interactive || followCursor
        ? safePolygon({
            buffer: interactiveBorder ?? 4,
          })
        : undefined,
    [interactive, followCursor, interactiveBorder],
  );

  const middleware = useMemo(() => {
    const middlewareList = [offset(distance), flip(), shift({ padding: 8 })];

    if (arrowEnabled) {
      middlewareList.push(arrow({ element: arrowRef }));
    }

    return middlewareList;
  }, [arrowEnabled, distance]);

  const floating = useFloating({
    middleware,
    onOpenChange: setOpen,
    open,
    placement: position,
    whileElementsMounted: autoUpdate,
  });

  const { refs, floatingStyles, context } = floating;

  const hover = useHover(context, {
    delay: delayToObject(delay),
    enabled: trigger === "mouseenter",
    handleClose: hoverHandleClose,
    move: !followCursor,
  });

  const focus = useFocus(context, {
    enabled: trigger === "mouseenter",
  });

  const click = useClick(context, {
    enabled: trigger === "click",
    event: "mousedown",
    toggle: true,
  });

  const dismiss = useDismiss(context, {
    outsidePressEvent: "mousedown",
    referencePress: trigger === "click" && hideOnClick,
  });

  const role = useRole(context, {
    role: trigger === "click" ? "dialog" : "tooltip",
  });

  const clientPoint = useClientPoint(context, {
    enabled: followCursor,
  });

  const { getFloatingProps, getReferenceProps } = useInteractions([
    hover,
    focus,
    click,
    dismiss,
    role,
    clientPoint,
  ]);

  const floatingSurfaceStyles: CSSProperties = {
    ...floatingStyles,
    ...(followCursor && !interactive ? { pointerEvents: "none" } : {}),
  };

  if (!content) {
    return <>{children}</>;
  }

  return (
    <>
      <ReferenceWrapper
        ref={refs.setReference}
        {...getReferenceProps()}
        style={style}
      >
        {children}
      </ReferenceWrapper>

      {open && (
        <FloatingContent
          arrowEnabled={arrowEnabled}
          arrowRef={arrowRef}
          context={context}
          content={content}
          floatingStyles={floatingSurfaceStyles}
          getFloatingProps={getFloatingProps}
          refs={refs}
          theme={theme}
        />
      )}
    </>
  );
};

export const Tooltip = (props: TooltipProps) => (
  <BaseFloating {...props} trigger={props.trigger ?? "mouseenter"} />
);

export type PopoverProps = Omit<TooltipProps, "trigger"> & {
  content: ReactNode;
};

export const Popover = ({ content, ...props }: PopoverProps) => (
  <BaseFloating
    {...props}
    html={content}
    interactive={props.interactive ?? true}
    theme={props.theme ?? "light"}
    trigger="click"
  />
);
