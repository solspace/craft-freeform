import { Sidebar } from "@components/layout/sidebar/sidebar";
import config from "@config/freeform/freeform.config";
import { BuilderContent, BuilderWrapper } from "@editor/builder/builder.styles";
import { HistoryArrow } from "@editor/builder/tabs/history-arrow";
import { DragContextProvider } from "@editor/builder/tabs/layout/drag.context";
import { FieldLayout } from "@editor/builder/tabs/layout/field-layout/field-layout";
import { FieldList } from "@editor/builder/tabs/layout/field-list/field-list";
import { Grid } from "@editor/builder/tabs/layout/layout.styles";
import { TabsNavigation } from "@editor/builder/tabs/tabs.navigation";
import {
  FormName,
  HeaderRow,
  Heading,
  HistoryButton,
  HistoryControls,
  SaveButton,
  SaveButtonWrapper,
  TabWrapper,
} from "@editor/builder/tabs/tabs.styles";
import { useFetchFieldTypes } from "@ff-client/queries/field-types";
import { QKForms } from "@ff-client/queries/forms";
import { QKNotifications } from "@ff-client/queries/notifications";
import type { FormSettingNamespace } from "@ff-client/types/forms";
import type { NotificationType } from "@ff-client/types/notifications";
import translate from "@ff-client/utils/translations";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Provider } from "react-redux";
import styled from "styled-components";
import {
  notificationTitle,
  WizardBuilderNotifications,
  WizardBuilderNotificationsSidebar,
  type WizardNotificationKind,
} from "./wizard.builder-notifications";
import { visibleBuilderPoint } from "./wizard.builder-pointer";
import {
  WizardBuilderSettings,
  WizardBuilderSettingsSidebar,
} from "./wizard.builder-settings";
import {
  createWizardBuilderStore,
  syncWizardBuilder,
  wizardBuilderState,
} from "./wizard.builder-state";
import { WizardFieldFlight } from "./wizard.field-flight";
import { useWizardPresetAnimation } from "./wizard.preset-animation";
import type { WizardDraft, WizardOptions } from "./wizard.types";

const emptyNotifications: NotificationType[] = [];
const emptySettings: FormSettingNamespace[] = [];
const pointerTravelMs = 550;
const pointerTargetDelayMs = 350;

const Stage = styled.div`
  position: fixed; inset: 18px; z-index: -1; background: var(--gray-100, #e7edf5);
  box-sizing: border-box; padding: 16px; border-radius: 12px; overflow: hidden;
  box-shadow: 0 0 0 1px #c8d4e1, 0 12px 40px #243b5326;
  color: #3f4d5a; pointer-events: none;
  &::after { content: ""; position: absolute; inset: 0; z-index: 1; background: #2d40550f; pointer-events: none; }
  transition: opacity .6s ease;
  animation: wizard-builder-open .48s cubic-bezier(.22,.7,.22,1) backwards;
  @keyframes wizard-builder-open { from { opacity: 0; clip-path: inset(16px 6px 0 round 12px); } to { opacity: 1; clip-path: inset(0 round 12px); } }
  &[data-revealing=true] { opacity: 0; }
  display: flex; flex-direction: column;
  > div:first-child { flex: 1; min-height: 0; height: auto; z-index: 0; }
  .builder-panel-canvas { display: flex; flex-direction: column; flex: 1; min-width: 0; overflow: hidden; }
  .builder-panel { flex: 1; min-width: 0; }
  .builder-sidebar-summary h3 { font-size: 12px; text-transform: uppercase; color: #61778b; margin: 0 0 16px; }
  .builder-sidebar-summary p { margin: 6px 0; font-size: 12px; padding: 8px 10px; }
  .builder-sidebar-summary small { color: #728499; }
  .builder-panel { padding: 24px; overflow: auto; }
  .builder-panel h3 { margin: 0 0 20px; font-size: 18px; }
  .builder-panel dl { margin: 0; }
  .builder-panel dt { font-size: 12px; font-weight: 600; margin: 18px 0 7px; }
  .builder-panel dd { margin: 0; padding: 12px; border: 1px solid #d1dce7; border-radius: 4px; overflow-wrap: anywhere; white-space: pre-wrap; background: #fbfcfe; }
  .builder-note { flex: none; margin: 0; padding: 8px 0 0; color: #637a8e; font-size: 12px; }
  [data-builder-highlight] { outline: 2px solid #438bce; outline-offset: 3px; box-shadow: 0 0 0 7px #438bce18; border-radius: 5px; }
  .builder-field-flight { position: fixed; z-index: 4; top: 0; left: 0; opacity: 0; display: flex; align-items: center; pointer-events: none; }
  .builder-field-flight svg { width: 25px; height: 30px; filter: drop-shadow(0 2px 3px #24415c60); }
  .builder-field-flight span { display: block; max-width: 180px; padding: 8px 12px; border: 1px solid #85acd0; border-radius: 4px; background: white; color: #3f4d5a; box-shadow: 0 5px 15px #24415c30; font-size: 12px; }
  .builder-pointer { position: fixed; z-index: 3; top: 0; left: 0; transition: transform ${pointerTravelMs}ms cubic-bezier(.22,.7,.22,1), opacity .2s; opacity: 0; }
  .builder-pointer[data-visible=true] { opacity: 1; }
  .builder-pointer svg { width: 27px; height: 32px; filter: drop-shadow(0 2px 3px #24415c60); }
  .builder-pointer span { display: block; width: max-content; max-width: 230px; margin: 4px 0 0 14px; padding: 7px 10px; border-radius: 5px; background: #2e6ea8; color: white; font-size: 12px; box-shadow: 0 3px 10px #24415c20; }
  .builder-pointer i { position: absolute; top: -9px; left: -9px; width: 20px; height: 20px; border: 2px solid #438bce; border-radius: 50%; opacity: 0; }
  .builder-pointer[data-visible=true] i { animation: wizard-builder-click .6s ${pointerTravelMs}ms ease-out; }
  @keyframes wizard-builder-click { from { transform: scale(.3); opacity: .8; } to { transform: scale(2); opacity: 0; } }
  @media (max-width: 1050px) { display: none; }
  @media (prefers-reduced-motion: reduce) { animation: none; transition: none; .builder-pointer { transition: none; } .builder-pointer i { animation: none !important; } }
`;

export function WizardBuilder({
  draft,
  options,
  step,
  hidden,
  movement,
  skipAnimation,
  onAnimationProgress,
  revealing = false,
}: {
  draft: WizardDraft;
  options: WizardOptions;
  step: number;
  hidden: boolean;
  movement: string;
  skipAnimation: number;
  onAnimationProgress: (
    progress: { count: number; total: number } | undefined,
  ) => void;
  revealing?: boolean;
}) {
  const { data: types, isError } = useFetchFieldTypes();
  const { data: notificationTypes = emptyNotifications } = useQuery<
    NotificationType[]
  >({
    queryKey: QKNotifications.types(),
    queryFn: () =>
      axios
        .get<NotificationType[]>("/api/notifications/types")
        .then(({ data }) => data.sort((a, b) => a.order - b.order)),
    staleTime: Infinity,
    enabled: !hidden && step === 5,
  });
  // Fetch metadata without the editor hook's global-store initialization side effect.
  const { data: settings = emptySettings } = useQuery<FormSettingNamespace[]>({
    queryKey: QKForms.settings(),
    queryFn: () =>
      axios
        .get<FormSettingNamespace[]>("/api/forms/settings")
        .then(({ data }) => data.sort((a, b) => a.order - b.order)),
    staleTime: Infinity,
    enabled: !hidden,
  });
  const settingsBefore = useRef(draft);
  const [guide, setGuide] = useState<{
    setting: string;
    site?: number;
    allSites?: boolean;
    notification?: WizardNotificationKind;
  }>({ setting: "name" });
  useEffect(() => {
    const before = settingsBefore.current;
    settingsBefore.current = draft;
    const sites = config.sites.list.filter(
      (site) =>
        before.siteIds.includes(site.id) !== draft.siteIds.includes(site.id),
    );
    if (sites.length)
      setGuide({
        setting: "sites",
        site: sites.length === 1 ? sites[0].id : undefined,
        allSites: sites.length > 1,
      });
    else {
      const setting = (
        [
          "name",
          "handle",
          "description",
          "color",
          "defaultStatus",
          "formattingTemplate",
          "storeData",
          "successBehavior",
          "successMessage",
          "errorMessage",
          "returnUrl",
        ] as const
      ).find((setting) => before[setting] !== draft[setting]);
      if (setting) setGuide({ setting });
      else {
        const changed = (
          [
            "adminEnabled",
            "adminEmail",
            "adminTemplate",
            "adminNewTemplate",
            "confirmationEnabled",
            "confirmationField",
            "confirmationTemplate",
            "confirmationNewTemplate",
          ] as const
        ).find((key) => before[key] !== draft[key]);
        if (changed)
          setGuide({
            notification: changed.startsWith("admin")
              ? "admin"
              : "confirmation",
            setting: changed.endsWith("Enabled")
              ? "enabled"
              : changed === "adminEmail"
                ? "recipients"
                : changed === "confirmationField"
                  ? "field"
                  : "template",
          });
      }
    }
  }, [draft]);
  const setting =
    step === 1
      ? [
          "name",
          "sites",
          "handle",
          "description",
          "color",
          "defaultStatus",
        ].includes(guide.setting)
        ? guide.setting
        : "name"
      : step === 3
        ? "formattingTemplate"
        : step === 4
          ? [
              "storeData",
              "successBehavior",
              "successMessage",
              "errorMessage",
              "returnUrl",
            ].includes(guide.setting)
            ? guide.setting
            : "successMessage"
          : "";
  const desiredSettingsSection =
    settings
      .flatMap((namespace) => namespace.properties)
      .find((property) => property.handle === setting)?.section ||
    (step === 4 ? "success-and-errors" : "general");
  const [store] = useState(createWizardBuilderStore);
  const reducedMotion = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(motionQuery).matches,
    () => true,
  );
  const reveal = useWizardPresetAnimation(
    draft,
    !hidden && step === 0 && Boolean(types?.length) && !reducedMotion,
    skipAnimation,
  );
  useEffect(() => {
    onAnimationProgress(
      reveal.active
        ? { count: reveal.count, total: draft.fields.length }
        : undefined,
    );
  }, [reveal.active, reveal.count, draft.fields.length, onAnimationProgress]);
  const state = useMemo(
    () => wizardBuilderState(reveal.preview, types ?? [], settings),
    [reveal.preview, types, settings],
  );
  const stage = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState<React.CSSProperties>();
  useLayoutEffect(() => {
    if (hidden) return;
    const app = document.querySelector<HTMLElement>("#freeform-client-app");
    if (!app) return;
    const align = () => {
      const rect = app.getBoundingClientRect();
      const css = getComputedStyle(app);
      const left = Math.max(16, rect.left + Number.parseFloat(css.paddingLeft));
      const right = Math.max(
        16,
        window.innerWidth - rect.right + Number.parseFloat(css.paddingRight),
      );
      setBounds({
        left,
        right,
        top: Math.max(24, rect.top - 8),
        bottom: 24,
      });
    };
    align();
    const observer = new ResizeObserver(align);
    observer.observe(app);
    window.addEventListener("resize", align);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", align);
    };
  }, [hidden]);
  const previous = useRef<WizardDraft | undefined>(undefined);
  const [pointer, setPointer] = useState({
    x: 0,
    y: 0,
    visible: false,
    label: "",
    sequence: 0,
    labelWidth: 230,
  });
  const desiredSection =
    step === 5
      ? "Notifications"
      : step === 1 || step === 3 || step === 4
        ? "Settings"
        : "Layout";
  const desiredNotification =
    guide.notification ?? (draft.adminEnabled ? "admin" : "confirmation");
  const notificationEnabled =
    desiredNotification === "admin"
      ? draft.adminEnabled
      : draft.confirmationEnabled;
  const [view, setView] = useState({
    section: desiredSection,
    settingsSection: desiredSettingsSection,
    notification: desiredNotification,
  });
  const viewRef = useRef(view);
  const { section, settingsSection, notification } = view;
  const [navigating, setNavigating] = useState(false);
  const [presentedDraft, setPresentedDraft] = useState(draft);
  const latestDraft = useRef(draft);
  latestDraft.current = draft;
  const tabs = [
    { to: "/wizard/layout", label: translate("Layout") },
    ...(config.limitations.can("notifications.tab")
      ? [{ to: "/wizard/notifications", label: translate("Notifications") }]
      : []),
    ...(config.limitations.can("rules.tab")
      ? [{ to: "/wizard/rules", label: translate("Rules") }]
      : []),
    ...(config.limitations.can("integrations.tab")
      ? [{ to: "/wizard/integrations", label: translate("Integrations") }]
      : []),
    ...(config.limitations.can("settings.tab")
      ? [{ to: "/wizard/settings", label: translate("Settings") }]
      : []),
    { to: "/wizard/preview", label: translate("Preview") },
  ];
  // Keep each visible navigation change at the pointer's click, not at the
  // wizard click that requested it. A newer destination cancels this sequence.
  // biome-ignore lint/correctness/useExhaustiveDependencies: Moving the dialog invalidates pointer coordinates; newly loaded notification metadata makes its sidebar targets available.
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let resume: (() => void) | undefined;
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        resume = resolve;
        timer = setTimeout(resolve, ms);
      });
    const commit = (changes: Partial<typeof viewRef.current>) => {
      viewRef.current = { ...viewRef.current, ...changes };
      setView(viewRef.current);
    };
    const click = async (selector: string, label: string) => {
      const target = stage.current?.querySelector<HTMLElement>(selector);
      const modal = stage.current?.parentElement
        ?.querySelector('[role="dialog"]')
        ?.getBoundingClientRect();
      const point =
        target &&
        modal &&
        visibleBuilderPoint(
          target.getBoundingClientRect(),
          modal,
          window.innerWidth,
          window.innerHeight,
          undefined,
          false,
          true,
        );
      if (!point || reducedMotion) return;
      setPointer((old) => ({
        ...point,
        label,
        visible: true,
        sequence: old.sequence + 1,
      }));
      await wait(pointerTravelMs);
    };
    const run = async () => {
      if (hidden || reducedMotion) {
        commit({
          section: desiredSection,
          settingsSection: desiredSettingsSection,
          notification: desiredNotification,
        });
        setNavigating(false);
        setPointer((old) => ({ ...old, visible: false }));
        return;
      }
      const enteringNotifications =
        desiredSection === "Notifications" &&
        viewRef.current.section !== "Notifications";
      const changeTab = viewRef.current.section !== desiredSection;
      const changeSettings =
        desiredSection === "Settings" &&
        viewRef.current.settingsSection !== desiredSettingsSection;
      const changeNotification =
        desiredSection === "Notifications" &&
        notificationEnabled &&
        (enteringNotifications ||
          viewRef.current.notification !== desiredNotification ||
          !stage.current?.querySelector(
            `[data-builder-notification="${desiredNotification}"]`,
          ));
      if (!changeTab && !changeSettings && !changeNotification) {
        setNavigating(false);
        setPointer((old) => ({ ...old, visible: false }));
        return;
      }
      setNavigating(true);
      await wait(100);
      if (cancelled) return;
      if (changeTab) {
        await click(
          `[data-builder-tab="/wizard/${desiredSection.toLowerCase()}"]`,
          translate(desiredSection),
        );
        if (cancelled) return;
        commit({ section: desiredSection });
        await wait(100);
        if (cancelled) return;
      }
      if (changeSettings) {
        await click(
          `[data-builder-section="${CSS.escape(desiredSettingsSection)}"]`,
          settings
            .flatMap((namespace) => namespace.sections)
            .find((item) => item.handle === desiredSettingsSection)?.label ||
            translate("Settings"),
        );
        if (cancelled) return;
        commit({ settingsSection: desiredSettingsSection });
      }
      if (changeNotification) {
        const existing = stage.current?.querySelector(
          `[data-builder-notification="${desiredNotification}"]`,
        );
        await click(
          `[data-builder-notification${existing ? "" : "-add"}="${desiredNotification}"]${existing ? "" : " button"}`,
          notificationTitle(desiredNotification),
        );
        if (cancelled) return;
        commit({ notification: desiredNotification });
        setPresentedDraft(latestDraft.current);
      }
      setNavigating(false);
    };
    void run();
    return () => {
      cancelled = true;
      clearTimeout(timer);
      resume?.();
    };
  }, [
    desiredSection,
    desiredSettingsSection,
    desiredNotification,
    notificationEnabled,
    hidden,
    reducedMotion,
    movement,
    settings,
    notificationTypes,
  ]);

  const synced = useRef(false);
  useLayoutEffect(() => {
    if (
      navigating ||
      section !== desiredSection ||
      (section === "Settings" && settingsSection !== desiredSettingsSection)
    )
      return;
    const sync = () => {
      store.dispatch(syncWizardBuilder(state));
      setPresentedDraft(draft);
      synced.current = true;
    };
    if (!synced.current || hidden || reducedMotion || section === "Layout")
      sync();
    else {
      const timer = setTimeout(sync, pointerTargetDelayMs + pointerTravelMs);
      return () => clearTimeout(timer);
    }
  }, [
    store,
    state,
    draft,
    hidden,
    reducedMotion,
    section,
    settingsSection,
    desiredSection,
    desiredSettingsSection,
    navigating,
  ]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Reposition after the user moves the dialog.
  useEffect(() => {
    const before = previous.current;
    previous.current = draft;
    if (hidden || reducedMotion || reveal.active) {
      setPointer((old) => ({ ...old, visible: false }));
      return;
    }
    if (
      !types?.length ||
      navigating ||
      section !== desiredSection ||
      (section === "Settings" && settingsSection !== desiredSettingsSection)
    )
      return;
    const changed = draft.fields.find((field, index) => {
      const old = before?.fields.find((item) => item.key === field.key);
      return (
        JSON.stringify(old) !== JSON.stringify(field) ||
        before?.fields[index]?.key !== field.key
      );
    });
    let target: HTMLElement | null = null;
    let timer: ReturnType<typeof setTimeout>;
    let frame = 0;
    const delay = setTimeout(() => {
      if (!stage.current?.getClientRects().length) return;
      const nameChanged = before && before.name !== draft.name && !changed;
      const siteName = config.sites.list.find(
        (site) => site.id === guide.site,
      )?.name;
      const selector =
        section === "Settings"
          ? setting === "sites" && (siteName || guide.allSites)
            ? `[data-builder-setting="sites"] #${CSS.escape(guide.allSites ? "sites-all" : `sites-${siteName}`)}`
            : `[data-builder-setting="${setting}"]`
          : nameChanged
            ? '[data-builder-target="name"]'
            : section !== "Layout"
              ? `[data-builder-notification-property="${guide.notification ? guide.setting : "name"}"]`
              : changed
                ? `[data-field-uid="wizard-field-${CSS.escape(changed.key)}"]`
                : '[data-builder-target="canvas"]';
      target = stage.current.querySelector<HTMLElement>(selector);
      if (target && (section === "Settings" || section === "Notifications")) {
        target =
          target.querySelector<HTMLElement>(
            '.active, input:not([type="hidden"]), textarea, select, button',
          ) || target;
      }
      if (!target) {
        setPointer((old) => ({ ...old, visible: false }));
        return;
      }
      target.scrollIntoView({
        block: "nearest",
        inline: "nearest",
        behavior: "instant",
      });
      frame = requestAnimationFrame(() => {
        if (!target) return;
        const rect = target.getBoundingClientRect();
        const modal = stage.current?.parentElement
          ?.querySelector('[role="dialog"]')
          ?.getBoundingClientRect();
        const canvas = target
          .closest('[data-builder-target="canvas"]')
          ?.getBoundingClientRect();
        const point =
          modal &&
          visibleBuilderPoint(
            rect,
            modal,
            window.innerWidth,
            window.innerHeight,
            canvas,
            target.matches(
              'input[type="checkbox"], input[type="radio"], [role="switch"]',
            ),
          );
        if (!point) {
          setPointer((old) => ({ ...old, visible: false }));
          return;
        }
        target.setAttribute("data-builder-highlight", "");
        setPointer((old) => ({
          ...point,
          visible: true,
          label:
            section === "Settings"
              ? setting === "sites"
                ? siteName || translate("Sites")
                : settings
                    .flatMap((namespace) => namespace.properties)
                    .find((property) => property.handle === setting)?.label ||
                  translate("Settings")
              : section === "Notifications"
                ? notificationTitle(notification)
                : nameChanged
                  ? translate("Form Name")
                  : changed && section === "Layout"
                    ? changed.label || translate("Field updated")
                    : translate(
                        section === "Layout" ? "Your form layout" : section,
                      ),
          sequence: old.sequence + 1,
        }));
        timer = setTimeout(() => {
          target?.removeAttribute("data-builder-highlight");
          setPointer((old) => ({ ...old, visible: false }));
        }, 2600);
      });
    }, pointerTargetDelayMs);
    return () => {
      clearTimeout(delay);
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      target?.removeAttribute("data-builder-highlight");
    };
  }, [
    draft,
    hidden,
    types,
    section,
    movement,
    reveal.active,
    guide,
    setting,
    settings,
    navigating,
    desiredSection,
    desiredSettingsSection,
    settingsSection,
    notification,
    reducedMotion,
  ]);

  if (hidden) return null;

  return (
    <Provider store={store}>
      <Stage
        ref={stage}
        style={bounds}
        data-revealing={revealing}
        aria-hidden="true"
        inert
      >
        <BuilderWrapper>
          <TabWrapper>
            <HeaderRow>
              <Heading
                data-builder-target="name"
                title={draft.name || translate("Create a new Form")}
              >
                <FormName>
                  {draft.name || translate("Create a new Form")}
                </FormName>
              </Heading>
              <TabsNavigation
                previewActive={tabs.findIndex(
                  (tab) => tab.label === translate(section),
                )}
                tabs={tabs}
              />
              <SaveButtonWrapper>
                <HistoryControls>
                  <HistoryButton
                    type="button"
                    disabled
                    aria-label={translate("Undo")}
                  >
                    <HistoryArrow direction="undo" />
                  </HistoryButton>
                  <HistoryButton
                    type="button"
                    disabled
                    aria-label={translate("Redo")}
                  >
                    <HistoryArrow direction="redo" />
                  </HistoryButton>
                </HistoryControls>
                <SaveButton
                  type="button"
                  className="btn submit"
                  aria-disabled="true"
                >
                  {translate("Save")}
                </SaveButton>
              </SaveButtonWrapper>
            </HeaderRow>
          </TabWrapper>
          <BuilderContent>
            <Grid>
              {section === "Settings" ? (
                <WizardBuilderSettingsSidebar
                  namespaces={settings}
                  section={settingsSection}
                />
              ) : section === "Notifications" ? (
                <WizardBuilderNotificationsSidebar
                  draft={presentedDraft}
                  options={options}
                  types={notificationTypes}
                  selected={notification}
                />
              ) : (
                <Sidebar $noPadding>
                  <FieldList />
                </Sidebar>
              )}
              <div
                className="builder-panel-canvas"
                data-builder-target="canvas"
              >
                {section === "Layout" ? (
                  isError ? (
                    <p className="builder-note">
                      {translate(
                        "Builder preview is unavailable. You can continue with guided setup.",
                      )}
                    </p>
                  ) : !types ? (
                    <p className="builder-note">
                      {translate("Loading builder preview…")}
                    </p>
                  ) : (
                    <DragContextProvider>
                      <FieldLayout />
                    </DragContextProvider>
                  )
                ) : section === "Settings" ? (
                  <WizardBuilderSettings
                    namespaces={settings}
                    section={settingsSection}
                  />
                ) : (
                  <WizardBuilderNotifications
                    draft={presentedDraft}
                    options={options}
                    types={notificationTypes}
                    selected={notification}
                  />
                )}
              </div>
            </Grid>
          </BuilderContent>
        </BuilderWrapper>
        <p className="builder-note">
          {translate("Your form is only saved when you choose Create form.")}
        </p>
        <WizardFieldFlight
          field={reveal.field}
          types={types ?? []}
          stage={stage}
        />
        <div
          className="builder-pointer"
          data-visible={pointer.visible}
          style={{ transform: `translate(${pointer.x}px, ${pointer.y}px)` }}
        >
          <i key={pointer.sequence} />
          <svg viewBox="0 0 28 34" fill="none">
            <title>{translate("Wizard pointer")}</title>
            <path
              d="M3 2v25l7-7 6 11 5-3-6-10h10L3 2Z"
              fill="#3478b9"
              stroke="white"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
          <span style={{ maxWidth: pointer.labelWidth }}>{pointer.label}</span>
        </div>
      </Stage>
    </Provider>
  );
}

const screenQuery = "(min-width: 1051px)";
const subscribeScreen = (listener: () => void) => {
  const query = window.matchMedia(screenQuery);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
};
export const useWizardBuilderScreen = () =>
  useSyncExternalStore(
    subscribeScreen,
    () => window.matchMedia(screenQuery).matches,
    () => false,
  );

const motionQuery = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (listener: () => void) => {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
};
