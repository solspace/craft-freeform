import type { PropsWithChildren, ReactElement } from 'react';
import React from 'react';
import { animated, useSprings } from 'react-spring';
import { shadows } from '@ff-client/styles/variables';
import styled from 'styled-components';

import { Sidebar } from './sidebar';

const SidebarSliderWrapper = styled.div`
  position: absolute !important;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
`;

const ChildItem = styled(animated.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  box-shadow: ${shadows.left};
`;

type SidebarSliderProps = {
  swiped: boolean;
};

export const SidebarSlider: React.FC<PropsWithChildren<SidebarSliderProps>> = ({
  swiped,
  children,
}) => {
  const subItems = children as ReactElement[];

  const styles = useSprings(
    subItems.length,
    subItems.map((_, i) => ({
      x: i ? (swiped ? -300 : 0) : swiped ? 0 : -300,
      opacity: i ? (swiped ? 0 : 1) : swiped ? 1 : 0,
      config: {
        tension: 200,
      },
    }))
  );

  return (
    <Sidebar>
      <SidebarSliderWrapper>
        {subItems.map((child, i) => (
          <ChildItem style={styles[i]} key={i}>
            {child}
          </ChildItem>
        ))}
      </SidebarSliderWrapper>
    </Sidebar>
  );
};
