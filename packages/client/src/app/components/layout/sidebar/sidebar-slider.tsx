import type { PropsWithChildren, ReactElement } from 'react';
import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import { animated, useSprings } from 'react-spring';
import { selectFocus } from '@editor/store/slices/context';
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

  const { active } = useSelector(selectFocus);
  const ref = useRef<HTMLDivElement>(null);

  const styles = useSprings(
    subItems.length,
    subItems.map((_, i) => ({
      x: i ? (swiped ? -300 : 0) : swiped ? 0 : 300,
      config: {
        mass: 1,
        tension: !open ? 350 : 200,
        friction: 26,
      },
    }))
  );

  return (
    <Sidebar style={{ overflow: active ? 'visible' : 'hidden' }} ref={ref}>
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
