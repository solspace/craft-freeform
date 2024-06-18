import React from 'react';
import { NavLink } from 'react-router-dom';
import { Breadcrumb } from '@components/breadcrumbs/breadcrumbs';
import translate from '@ff-client/utils/translations';
import { generateUrl } from '@ff-client/utils/urls';

import CheckIcon from './check.icon.svg';
import { Logo } from './logo';
import { useWelcomeAnimations } from './welcome.animations';
import {
  Button,
  ButtonsWrapper,
  ExtraContentWrapper,
  InstallIcon,
  InstallText,
  InstallWrapper,
  LogoWrapper,
  WelcomeWrapper,
} from './welcome.styles';

export const Welcome: React.FC = () => {
  const { installed, extra, buttons } = useWelcomeAnimations();

  return (
    <WelcomeWrapper>
      <Breadcrumb id="welcome" label="Welcome" url="/forms" />
      <LogoWrapper>
        <Logo />
      </LogoWrapper>

      <InstallWrapper>
        <InstallIcon style={installed.icon}>
          <CheckIcon />
        </InstallIcon>
        <InstallText style={installed.text}>
          <span>{translate('Freeform installed successfully!')}</span>
        </InstallText>
      </InstallWrapper>

      <ExtraContentWrapper style={extra}>
        {translate(
          'Thank you for choosing Freeform! Craft will install the free Express edition by default. If you wish to maximize your experience, be sure to manually switch the edition to Lite or Pro. Below are a few helpful links to get you started.'
        )}
      </ExtraContentWrapper>

      <ButtonsWrapper>
        <Button style={buttons[0]} className="btn">
          <NavLink to="/forms">{translate('Create Forms')}</NavLink>
        </Button>
        <Button style={buttons[2]} className="btn">
          <a href={generateUrl('/settings/demo-templates')}>
            {translate('Install Demo')}
          </a>
        </Button>
        <Button style={buttons[1]} className="btn submit">
          <a href={generateUrl('/settings')}>
            {translate('Configure Freeform')}
          </a>
        </Button>
      </ButtonsWrapper>
    </WelcomeWrapper>
  );
};
