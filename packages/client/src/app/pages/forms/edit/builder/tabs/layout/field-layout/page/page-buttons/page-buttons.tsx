import React from 'react';
import type {
  Page,
  PageButton,
  PageButtonType,
} from '@editor/builder/types/layout';
import { useAppDispatch } from '@editor/store';
import { contextActions, FocusType } from '@editor/store/slices/context';

import { ButtonGroup, ButtonGroupWrapper } from './page-buttons.styles';

type Props = {
  page: Page;
};

export const PageButtons: React.FC<Props> = ({ page }) => {
  const dispatch = useAppDispatch();

  const layout = page.buttons?.layout || 'save back|submit';
  const groups = layout.split(' ');

  const buttonGroups: Array<Array<PageButton>> = [];
  groups.forEach((group) => {
    const buttons = group.split('|');
    const buttonGroup: PageButton[] = [];
    buttons.forEach((buttonHandle) => {
      if (buttonHandle === 'back' && page.order === 0) {
        return;
      }

      const button = page.buttons[buttonHandle as PageButtonType];
      if (!button || !button.enabled) {
        return;
      }

      buttonGroup.push(button);
    });

    buttonGroups.push(buttonGroup);
  });

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
        {buttonGroups.map((group, index) => (
          <ButtonGroup key={index}>
            {group.map((button, index) => (
              <button className="btn submit" key={index} type="button">
                {button.label}
              </button>
            ))}
          </ButtonGroup>
        ))}
      </ButtonGroupWrapper>
    </div>
  );
};
