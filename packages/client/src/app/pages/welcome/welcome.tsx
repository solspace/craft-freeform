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
      <Breadcrumb label="Welcome" url="/forms" />
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
        {translate(`
          Cupidatat irure laboris cupidatat adipisicing consectetur excepteur.
          Velit excepteur in sunt id duis est est eu. Aute ea ut minim et ea quis
          sint. Ipsum amet voluptate laboris ipsum sunt ipsum tempor tempor elit
          Lorem et sunt.
        `)}
      </ExtraContentWrapper>

      <ButtonsWrapper>
        <Button style={buttons[0]} className="btn">
          <NavLink to="/forms">{translate('Dashboard')}</NavLink>
        </Button>
        <Button style={buttons[1]} className="btn">
          <a href={generateUrl('/settings')}>{translate('Settings')}</a>
        </Button>
        <Button style={buttons[2]} className="btn">
          <a href={generateUrl('/settings/demo-templates')}>
            {translate('Install Demo Templates')}
          </a>
        </Button>
        <Button style={buttons[3]} className="btn submit">
          <NavLink to="/forms">{translate('Close Wizard')}</NavLink>
        </Button>
      </ButtonsWrapper>
    </WelcomeWrapper>
  );
};
