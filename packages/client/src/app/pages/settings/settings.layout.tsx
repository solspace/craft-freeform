import { PageFooter } from "@components/layout/blocks/page-footer";
import type React from "react";
import { SettingsSidebar } from "./settings.sidebar";

type Props = {
  activeKey: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
};

export const SettingsLayout: React.FC<Props> = ({
  activeKey,
  header,
  footer,
  children,
}) => (
  <div className="freeform-secondary-layout">
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
  </div>
);
