import { TabsWrapper } from '@editor/builder/tabs/tabs.styles';
import { scrollBar } from '@ff-client/styles/mixins';
import { borderRadius, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const EditorContainer = styled.div`
  position: relative;
  height: 100%;
`;

export const EditorWrapper = styled.div`
  position: relative;
  z-index: 2;

  display: flex;
  flex-direction: column;
  gap: 24px;

  padding: ${spacings.xl};

  height: 100%;
  overflow-y: auto;

  background: white;

  border-top-right-radius: ${borderRadius.lg};
  border-bottom-right-radius: ${borderRadius.lg};

  ${scrollBar};

  hr {
    margin: 0;
    margin-inline: calc(var(--xl) * -1);
  }
`;

export const ActionsWrapper = styled.div`
  position: absolute;
  right: 0;
  top: -44px;
`;

export const EditorTabsWrapper = styled(TabsWrapper)`
  position: absolute;
  left: 0;
  top: -49px;
  z-index: 1;
`;
