import type { FC, ReactNode } from "react";

type Props = {
  activeKey: string;
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
};

export const SettingsLayout: FC<Props> = ({ header, footer, children }) => (
  <div className="freeform-settings-layout">
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
