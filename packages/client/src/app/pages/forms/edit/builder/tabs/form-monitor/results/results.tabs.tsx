import classes from "@ff-client/utils/classes";
import translate from "@ff-client/utils/translations";
import type React from "react";

import {
  TabButton,
  TabContainer,
  TabContent,
  TabItem,
  TabWrapper,
} from "./results.tabs.styles";

type Tab = {
  id: string;
  label: string;
  content: React.ReactNode;
};

type ResultsTabsProps = {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
};

export const ResultsTabs: React.FC<ResultsTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  return (
    <TabContainer>
      <TabWrapper>
        {tabs.map((tab) => (
          <TabItem key={tab.id}>
            <TabButton
              className={classes(activeTab === tab.id && "active")}
              onClick={() => onTabChange(tab.id)}
            >
              {translate(tab.label)}
            </TabButton>
          </TabItem>
        ))}
      </TabWrapper>
      <TabContent>
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </TabContent>
    </TabContainer>
  );
};
