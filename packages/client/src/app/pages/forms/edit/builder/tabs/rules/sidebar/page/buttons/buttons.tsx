import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getButtonGroups } from '@editor/builder/tabs/layout/field-layout/page/page-buttons/page-buttons.operations';
import type { Page } from '@editor/builder/types/layout';
import classes from '@ff-client/utils/classes';

import { Button, ButtonGroup, ButtonsWrapper } from './buttons.styles';

type Props = {
  page: Page;
};

export const Buttons: React.FC<Props> = ({ page }) => {
  const params = useParams();
  console.log(params);
  const { button: currentButton } = useParams();
  const navigate = useNavigate();
  const buttonGroups = getButtonGroups(page);

  return (
    <ButtonsWrapper>
      {buttonGroups.map((group, index) => (
        <ButtonGroup key={index} className="page-buttons">
          {group.map((button, index) => (
            <Button
              className={classes(
                'btn small',
                button.handle === 'submit' && 'submit',
                button.handle === currentButton && 'active'
              )}
              key={index}
              type="button"
              onClick={() => {
                navigate(`page/${page.uid}/buttons/${button.handle}`);
              }}
            >
              {button.label}
            </Button>
          ))}
        </ButtonGroup>
      ))}
    </ButtonsWrapper>
  );
};
