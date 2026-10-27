import { PageFooter } from "@components/layout/blocks/page-footer";
import { createElement, type FC, type ReactNode } from "react";
import { SettingsSidebar } from "./settings.sidebar";

type Props = {
  activeKey: string;
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
};

export const SettingsLayout: FC<Props> = ({
  activeKey,
  header,
  footer,
  children,
}) =>
  createElement(
    "craft-pane",
    { className: "freeform-settings-surface", padding: "0" },
    <div className="freeform-secondary-layout" slot="body">
      <SettingsSidebar activeKey={activeKey} />
      {header}
      <div id="main-content">
        <div id="content-container">
          <div id="content" className="content-pane">
            {children}
          </div>
        </div>
      </div>
      {footer && (
        <>
          <PageFooter />
          <footer className="freeform-form-footer">{footer}</footer>
        </>
      )}
    </div>,
  );
