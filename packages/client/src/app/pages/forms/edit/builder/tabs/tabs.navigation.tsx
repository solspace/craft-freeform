import classes from "@ff-client/utils/classes";
import translate from "@ff-client/utils/translations";
import {
  autoUpdate,
  FloatingFocusManager,
  FloatingPortal,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useListNavigation,
  useRole,
} from "@floating-ui/react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { matchPath, NavLink, useLocation } from "react-router-dom";
import { fitTabs } from "./tabs.overflow";
import {
  MoreButton,
  OverflowMenu,
  TabMeasurements,
  TabsRegion,
  TabsWrapper,
} from "./tabs.styles";

export type BuilderTab = {
  to: string;
  label: string;
  end?: boolean;
  errors?: boolean;
};

const Chevron = () => (
  <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true">
    <path
      d="m1 1 4 4 4-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

export function TabsNavigation({ tabs }: { tabs: BuilderTab[] }) {
  const tabCount = tabs.length;
  const { pathname } = useLocation();
  const active = Math.max(
    0,
    tabs.findIndex((tab) =>
      matchPath({ path: tab.to, end: tab.end ?? false }, pathname),
    ),
  );
  const region = useRef<HTMLDivElement>(null);
  const measurements = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState<number[]>([active]);
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const listRef = useRef<Array<HTMLAnchorElement | null>>([]);
  const menuId = useId();

  // ResizeObserver already tracks label and error widths across renders.
  useLayoutEffect(() => {
    const measure = () => {
      if (!region.current || !measurements.current) return;
      const available = region.current.getBoundingClientRect().width - 2;
      if (available <= 0) return;
      const nodes = Array.from(measurements.current.children);
      const widths = nodes
        .slice(0, tabCount)
        .map((node) => node.getBoundingClientRect().width);
      const moreWidth = nodes[tabCount]?.getBoundingClientRect().width ?? 0;
      const next = fitTabs(widths, available, moreWidth, active);
      setVisible((previous) =>
        previous.join() === next.join() ? previous : next,
      );
    };
    measure();
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measure);
    if (region.current) observer?.observe(region.current);
    if (measurements.current) {
      Array.from(measurements.current.children).forEach((node) => {
        observer?.observe(node);
      });
    }
    window.addEventListener("resize", measure);
    document.fonts?.addEventListener("loadingdone", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
      document.fonts?.removeEventListener("loadingdone", measure);
    };
  }, [active, tabCount]);

  const overflow = tabs.filter((_, index) => !visible.includes(index));
  useEffect(() => {
    if (!overflow.length) setOpen(false);
  }, [overflow.length]);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-end",
    strategy: "fixed",
    middleware: [offset(6), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });
  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
    [
      useClick(context),
      useDismiss(context),
      useRole(context, { role: "menu" }),
      useListNavigation(context, {
        listRef,
        activeIndex: focusIndex,
        onNavigate: setFocusIndex,
        loop: true,
      }),
    ],
  );

  return (
    <TabsRegion ref={region}>
      <TabsWrapper className="main-tabs">
        {tabs.map((tab, index) =>
          visible.includes(index) ? (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={classes(tab.errors && "errors")}
              title={tab.label}
            >
              <span>{tab.label}</span>
            </NavLink>
          ) : null,
        )}
        {overflow.length > 0 && (
          <MoreButton
            ref={refs.setReference}
            type="button"
            className={classes(overflow.some((tab) => tab.errors) && "errors")}
            {...getReferenceProps({
              "aria-controls": open ? menuId : undefined,
            })}
          >
            <span>{translate("More")}</span>
            <Chevron />
          </MoreButton>
        )}
      </TabsWrapper>
      <TabMeasurements ref={measurements} aria-hidden="true" inert>
        {tabs.map((tab) => (
          <span key={tab.to} className={classes(tab.errors && "errors")}>
            <span>{tab.label}</span>
          </span>
        ))}
        <span className={classes(tabs.some((tab) => tab.errors) && "errors")}>
          <span>{translate("More")}</span>
          <Chevron />
        </span>
      </TabMeasurements>
      {open && overflow.length > 0 && (
        <FloatingPortal>
          <FloatingFocusManager
            context={context}
            modal={false}
            initialFocus={-1}
          >
            <OverflowMenu
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps({ id: menuId })}
            >
              {overflow.map((tab, index) => (
                <NavLink
                  key={tab.to}
                  ref={(node) => {
                    listRef.current[index] = node;
                  }}
                  to={tab.to}
                  end={tab.end}
                  role="menuitem"
                  tabIndex={focusIndex === index ? 0 : -1}
                  className={classes(tab.errors && "errors")}
                  {...getItemProps({ onClick: () => setOpen(false) })}
                >
                  {tab.label}
                  {tab.errors && <span data-icon="alert" aria-hidden="true" />}
                </NavLink>
              ))}
            </OverflowMenu>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </TabsRegion>
  );
}
