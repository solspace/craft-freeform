import { Breadcrumb } from "@components/breadcrumbs/breadcrumbs";
import config, { Edition } from "@config/freeform/freeform.config";
import translate from "@ff-client/utils/translations";
import { generateUrl } from "@ff-client/utils/urls";
import type React from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { EditionComparison } from "./welcome.editions";
import { SetupGuide } from "./welcome.setup";
import type { SetupClient } from "./welcome.setup.api";
import { WelcomeWrapper } from "./welcome.styles";
import { WelcomeWordmark } from "./welcome.wordmark";

type WelcomeContentProps = {
  edition: Edition;
  settingsUrl: string;
  demosUrl: string;
  initialView?: "welcome" | "setup";
  setupApi?: SetupClient;
  onWelcome?: () => void;
  setupBackLabel?: string;
  canUseSetupGuide?: boolean;
};

const Arrow = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M4 12h15m-6-6 6 6-6 6" />
  </svg>
);

const ResourceIcon = ({
  kind,
}: {
  kind: "demo" | "settings" | "guide" | "edition";
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {kind === "demo" && (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 9h18M8 9v11M11 13h6m-6 3h4" />
      </>
    )}
    {kind === "settings" && (
      <>
        <path d="M4 6h16M4 12h16M4 18h16" />
        <circle cx="8" cy="6" r="2" fill="white" />
        <circle cx="16" cy="12" r="2" fill="white" />
        <circle cx="10" cy="18" r="2" fill="white" />
      </>
    )}
    {kind === "edition" && (
      <path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5" />
    )}
    {kind === "guide" && (
      <>
        <path d="M12 5v15M3 4c4-1 7-1 9 1 2-2 5-2 9-1v15c-4-1-7-1-9 1-2-2-5-2-9-1V4Z" />
        <path d="M6 8h3m-3 4h3m6-4h3m-3 4h3" />
      </>
    )}
  </svg>
);

export const WelcomeContent: React.FC<WelcomeContentProps> = ({
  edition,
  settingsUrl,
  demosUrl,
  initialView = "welcome",
  setupApi,
  onWelcome,
  setupBackLabel,
  canUseSetupGuide = false,
}) => {
  const editionLabel = {
    [Edition.Express]: "Express",
    [Edition.Lite]: "Lite",
    [Edition.Pro]: "Pro",
  }[edition];

  const [view, setView] = useState<"welcome" | "editions" | "setup">(
    initialView,
  );
  const [secondaryView, setSecondaryView] = useState<"editions" | "setup">(
    initialView === "setup" ? "setup" : "editions",
  );
  const [setupKey, setSetupKey] = useState(0);
  const openView = (next: "editions" | "setup") => {
    setSecondaryView(next);
    if (next === "setup") setSetupKey((current) => current + 1);
    setView(next);
  };
  const comparing = view === "editions";
  const secondaryOpen = view !== "welcome";
  const setupButton = useRef<HTMLButtonElement>(null);
  const setupHeading = useRef<HTMLHeadingElement>(null);
  const previousView = useRef(view);
  const goHome = () => {
    if (initialView === "setup" && onWelcome) {
      onWelcome();
      return;
    }
    setView("welcome");
    onWelcome?.();
  };
  const compareButton = useRef<HTMLButtonElement>(null);
  const comparisonHeading = useRef<HTMLHeadingElement>(null);
  const hasCompared = useRef(false);
  const canvas = useRef<HTMLDivElement>(null);
  const comparison = useRef<HTMLDivElement>(null);
  const resources = useRef<HTMLElement>(null);
  const [canvasHeight, setCanvasHeight] = useState<number>();

  useLayoutEffect(() => {
    const measure = () => {
      if (!canvas.current || !comparison.current || !resources.current) return;
      const style = getComputedStyle(canvas.current);
      const padding =
        Number.parseFloat(style.paddingTop) +
        Number.parseFloat(style.paddingBottom);
      const contentHeight = secondaryOpen
        ? comparison.current.scrollHeight
        : 320 + resources.current.getBoundingClientRect().height;
      setCanvasHeight(
        Math.ceil(Math.max(window.innerHeight - 120, contentHeight + padding)),
      );
    };
    measure();
    const observer =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(measure);
    if (resources.current) observer?.observe(resources.current);
    if (comparison.current) observer?.observe(comparison.current);
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [secondaryOpen]);

  useEffect(() => {
    if (!secondaryOpen && !hasCompared.current) return;
    hasCompared.current = true;
    const frame = requestAnimationFrame(() => {
      const target = secondaryOpen
        ? comparing
          ? comparisonHeading.current
          : setupHeading.current
        : previousView.current === "setup"
          ? setupButton.current
          : compareButton.current;
      target?.focus({ preventScroll: true });
      previousView.current = view;
    });
    return () => cancelAnimationFrame(frame);
  }, [secondaryOpen, comparing, view]);

  return (
    <WelcomeWrapper
      className="content-pane"
      ref={canvas}
      style={{ height: canvasHeight }}
      data-comparing={secondaryOpen}
      onKeyDown={(event) => {
        if (comparing && event.key === "Escape") {
          event.stopPropagation();
          setView("welcome");
        }
      }}
    >
      <div
        className="welcome-home welcome-view"
        inert={secondaryOpen}
        aria-hidden={secondaryOpen}
      >
        <header className="welcome-hero">
          <div className="welcome-copy">
            <div className="welcome-brand">
              <WelcomeWordmark iconOnly />
            </div>
            <h1>{translate("Ready for your first form.")}</h1>
            <div className="welcome-actions">
              <Link
                to="/forms"
                state={{ welcomeStart: true }}
                className="btn submit"
              >
                {translate("Start building")}
                <Arrow />
              </Link>
            </div>
          </div>
        </header>

        <section
          className="welcome-next"
          ref={resources}
          aria-label={translate("Welcome")}
        >
          <div className="welcome-resources">
            <a href={demosUrl} className="welcome-resource">
              <span className="welcome-resource-icon">
                <ResourceIcon kind="demo" />
              </span>
              <span className="welcome-resource-action">
                {translate("Set up demo templates")}
                <Arrow />
              </span>
              <span className="welcome-resource-description">
                {translate("Try your forms on the front end.")}
              </span>
            </a>
            {canUseSetupGuide ? (
              <button
                type="button"
                className="welcome-resource welcome-setup-trigger"
                ref={setupButton}
                onClick={() => openView("setup")}
                aria-expanded={view === "setup"}
                aria-controls="setup-guide-title"
              >
                <span className="welcome-resource-icon">
                  <ResourceIcon kind="settings" />
                </span>
                <span className="welcome-resource-action">
                  {translate("Configure Freeform")}
                  <Arrow />
                </span>
                <span className="welcome-resource-description">
                  {translate("Choose your default settings.")}
                </span>
              </button>
            ) : (
              <a href={settingsUrl} className="welcome-resource">
                <span className="welcome-resource-icon">
                  <ResourceIcon kind="settings" />
                </span>
                <span className="welcome-resource-action">
                  {translate("Configure Freeform")}
                  <Arrow />
                </span>
                <span className="welcome-resource-description">
                  {translate("Choose your default settings.")}
                </span>
              </a>
            )}
            <a
              href="https://docs.solspace.com/craft/freeform/v5/guides/getting-started/"
              className="welcome-resource"
              target="_blank"
              rel="noreferrer"
            >
              <span className="welcome-resource-icon">
                <ResourceIcon kind="guide" />
              </span>
              <span className="welcome-resource-action">
                {translate("Follow the guide")}
                <Arrow />
              </span>
              <span className="welcome-resource-description">
                {translate("Create and publish your first form.")}
              </span>
            </a>
            <button
              type="button"
              className="welcome-resource welcome-compare-trigger"
              onClick={() => openView("editions")}
              ref={compareButton}
              aria-expanded={comparing}
              aria-controls="edition-comparison-title"
            >
              <span className="welcome-resource-icon">
                <ResourceIcon kind="edition" />
              </span>
              <span className="welcome-resource-action">
                {translate(
                  edition === Edition.Pro
                    ? "Compare editions"
                    : "Explore Freeform Pro",
                )}
                <Arrow />
              </span>
              <span className="welcome-resource-description">
                {edition === Edition.Pro
                  ? translate("See what’s included in Freeform {edition}.", {
                      edition: editionLabel,
                    })
                  : translate("See what Pro adds to your forms.")}
              </span>
            </button>
          </div>
        </section>
      </div>
      <div
        className="welcome-comparison-view"
        ref={comparison}
        inert={!secondaryOpen}
        aria-hidden={!secondaryOpen}
      >
        {secondaryView === "setup" ? (
          <SetupGuide
            key={setupKey}
            headingRef={setupHeading}
            onBack={goHome}
            backLabel={setupBackLabel}
            hideAllSettings={initialView === "setup"}
            onSaved={initialView === "setup" ? onWelcome : undefined}
            client={setupApi}
          />
        ) : (
          <EditionComparison
            edition={edition}
            headingRef={comparisonHeading}
            onBack={goHome}
          />
        )}
      </div>
    </WelcomeWrapper>
  );
};

export const Welcome = ({ setup = false }: { setup?: boolean }) => {
  return (
    <>
      <Breadcrumb
        id={setup ? "setup" : "welcome"}
        label={translate(setup ? "Setup Guide" : "Welcome")}
        url={setup ? "/settings/setup" : "/welcome"}
      />
      <WelcomeContent
        key={setup ? "setup" : "welcome"}
        edition={config.editions.edition}
        canUseSetupGuide={config.metadata?.freeform?.canUseSetupGuide === true}
        settingsUrl={generateUrl("/settings")}
        demosUrl={generateUrl("/settings/demo-templates")}
        initialView={setup ? "setup" : "welcome"}
        setupBackLabel={setup ? "Back to settings" : undefined}
        onWelcome={() => {
          if (setup) window.location.assign(generateUrl("settings"));
        }}
      />
    </>
  );
};
