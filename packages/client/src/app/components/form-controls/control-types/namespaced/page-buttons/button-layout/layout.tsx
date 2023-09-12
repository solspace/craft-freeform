import type { ReactNode } from 'react';
import React from 'react';
import { Control } from '@components/form-controls/control';
import type { ControlType } from '@components/form-controls/types';
import type { Page } from '@editor/builder/types/layout';
import type { PageButtonsLayoutProperty } from '@ff-client/types/properties';
import classes from '@ff-client/utils/classes';

import BackIcon from './icons/back.svg';
import SaveIcon from './icons/save.svg';
import SubmitIcon from './icons/submit.svg';
import {
  Button,
  ButtonGroup,
  ButtonLayoutWrapper,
  LayoutBlock,
} from './layout.styles';

const layouts = [
  'back|submit|save',
  'save|back|submit',
  ' back|submit|save',
  ' save|back|submit',
  ' save|back|submit ',
  ' back|submit|save ',
  'back|submit save',
  'save back|submit',
];

const icons: Record<string, ReactNode> = {
  save: <SaveIcon />,
  back: <BackIcon />,
  submit: <SubmitIcon />,
};

const PageButtonLayout: React.FC<
  ControlType<PageButtonsLayoutProperty, Page>
> = ({ value, property, errors, updateValue, context }) => {
  const buttonState: Record<string, boolean> = {
    save: context?.buttons?.save?.enabled,
    back: context?.buttons?.back?.enabled,
    submit: context?.buttons?.submit?.enabled,
  };

  return (
    <Control property={property} errors={errors}>
      <ButtonLayoutWrapper>
        {layouts.map((item, idx) => (
          <LayoutBlock
            key={idx}
            onClick={() => updateValue(item)}
            className={classes(value === item && 'active')}
          >
            {item.split(' ').map((group, groupIdx) => (
              <ButtonGroup key={groupIdx}>
                {group
                  .split('|')
                  .filter(Boolean)
                  .map((button, buttonIdx) => (
                    <Button
                      className={classes(
                        button,
                        buttonState?.[button] && 'enabled'
                      )}
                      key={buttonIdx}
                    >
                      {icons[button]}
                    </Button>
                  ))}
              </ButtonGroup>
            ))}
          </LayoutBlock>
        ))}
      </ButtonLayoutWrapper>
    </Control>
  );
};

export default PageButtonLayout;
