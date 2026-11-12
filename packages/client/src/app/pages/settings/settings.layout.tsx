import type { FC, ReactNode } from "react";
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
    {footer && <footer className="freeform-form-footer">{footer}</footer>}
  </div>
);
