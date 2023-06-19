import React from 'react';
import type { Page, PageButtonType } from '@editor/builder/types/layout';
import { useAppDispatch } from '@editor/store';
import { contextActions, FocusType } from '@editor/store/slices/context';

import { ButtonGroup, ButtonGroupWrapper } from './page-buttons.styles';

type Props = {
  page: Page;
};

export const PageButtons: React.FC<Props> = ({ page }) => {
  const dispatch = useAppDispatch();

  const layout = page.buttons.layout;
  const groups = layout.split(' ');

  return (
    <div>
      <ButtonGroupWrapper
        onClick={() => {
          dispatch(
            contextActions.setFocusedItem({
              type: FocusType.Page,
              uid: page.uid,
            })
          );
        }}
      >
        {groups.map((group, index) => (
          <ButtonGroup key={index}>
            {group.split('|').map((button, index) => (
              <button className="btn submit" key={index} type="button">
                {page.buttons[button as PageButtonType]?.label}
              </button>
            ))}
          </ButtonGroup>
        ))}
      </ButtonGroupWrapper>
    </div>
  );
};
