import FormWrapper from '@ff-app/welcome-screen/shared/components/form/FormWrapper';
import InfoField from '@ff-app/welcome-screen/shared/components/form/InfoField/InfoField';
import LightSwitchField from '@ff-app/welcome-screen/shared/components/form/LightSwitchField/LightSwitchField';
import SelectField, { Options } from '@ff-app/welcome-screen/shared/components/form/SelectField/SelectField';
import Heading from '@ff-app/welcome-screen/shared/components/Typography/Heading/Heading';
import Paragraph from '@ff-app/welcome-screen/shared/components/Typography/Paragraph/Paragraph';
import { Italics } from '@ff-app/welcome-screen/shared/components/Typography/Typography.styles';
import { SpamBehaviour } from '@ff-app/welcome-screen/shared/interfaces/settings';
import SpamState from '@ff-welcome-screen/shared/recoil/atoms/spam';
import React from 'react';
import { CSSTransition } from 'react-transition-group';
import { useRecoilState } from 'recoil';

const Spam: React.FC = () => {
  const [state, setState] = useRecoilState(SpamState);

  const spamBehaviourOptions: Options<SpamBehaviour> = [
    { value: SpamBehaviour.SimulateSuccess, label: 'Simulate Success (recommended)' },
    { value: SpamBehaviour.DisplayErrors, label: 'Display Errors' },
  ];

  return (
    <div>
      <Heading>Spam Protection</Heading>
      <Paragraph>
        Freeform includes a wide variety of robust spam control features to make managing forms and protecting them
        against spam easier. These can later be adjusted by going to the{' '}
        <Italics>
          Freeform {'->'} Settings {'->'} Spam Settings
        </Italics>{' '}
        page. The following are defaulted to what's recommended...
      </Paragraph>

      <FormWrapper>
        <LightSwitchField
          description="Would you like to enable the Freeform Honeypot protection?"
          value={state.honeypot}
          onChange={(value): void => {
            setState((oldState) => ({
              ...oldState,
              honeypot: value,
            }));
          }}
        />

        <CSSTransition mountOnEnter unmountOnExit in={state.honeypot} timeout={300} classNames="animation">
          <LightSwitchField
            description="Would you like to enable the javascript enhancement for the Freeform Honeypot?"
            value={state.enhancedHoneypot}
            onChange={(value): void => {
              setState((oldState) => ({
                ...oldState,
                enhancedHoneypot: value,
              }));
            }}
          />
        </CSSTransition>

        <LightSwitchField
          description="Would you like to enable the built-in Freeform Spam Folder to catch all spammy submissions and false positives? This is strongly recommended as it will allow you to retrieve incorrectly flagged submissions rather than losing the data forever."
          value={state.spamFolder}
          onChange={(value): void => {
            setState((oldState) => ({
              ...oldState,
              spamFolder: value,
            }));
          }}
        />

        <SelectField
          description="Which page should be loaded when you click on the Freeform link in the CP nav?"
          value={state.spamBehaviour}
          options={spamBehaviourOptions}
          onChange={(event): void => {
            setState((oldState) => ({
              ...oldState,
              spamBehaviour: event.target.value as SpamBehaviour,
            }));
          }}
        />

        <InfoField>
          To enable reCAPTCHA, please visit the{' '}
          <Italics>
            Freeform {'->'} Settings {'->'} reCAPTCHA
          </Italics>{' '}
          page later to set up.
        </InfoField>
      </FormWrapper>
    </div>
  );
};

export default Spam;
