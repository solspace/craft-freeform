import { TabsWrapper } from "@editor/builder/tabs/tabs.styles";
import { scrollBar } from "@ff-client/styles/mixins";
import { borderRadius, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const EditorContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 100%;
`;

export const EditorWrapper = styled.div`
  position: relative;
  z-index: 2;

  display: flex;
  flex-direction: column;
  gap: 24px;

  padding: ${spacings.xl};

  flex: 1;
  min-height: 0;

  background: white;

  border-top-right-radius: ${borderRadius.lg};
  border-bottom-right-radius: ${borderRadius.lg};

  ${scrollBar};

  hr {
    margin: 0;
    margin-inline: calc(var(--xl) * -1);
  }
`;

export const ActionsWrapper = styled.footer`
  flex-shrink: 0;
`;

export const EditorTabsWrapper = styled(TabsWrapper)`
  position: absolute;
  left: 0;
  top: -49px;
  z-index: 1;
`;
