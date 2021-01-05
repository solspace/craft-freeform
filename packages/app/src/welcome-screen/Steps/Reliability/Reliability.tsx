import FormWrapper from '@ff-app/welcome-screen/shared/components/form/FormWrapper';
import LightSwitchField from '@ff-app/welcome-screen/shared/components/form/LightSwitchField/LightSwitchField';
import SelectField, { Options } from '@ff-app/welcome-screen/shared/components/form/SelectField/SelectField';
import TextField from '@ff-app/welcome-screen/shared/components/form/TextField/TextField';
import Heading from '@ff-app/welcome-screen/shared/components/Typography/Heading/Heading';
import Paragraph from '@ff-app/welcome-screen/shared/components/Typography/Paragraph/Paragraph';
import { DigestFrequency } from '@ff-app/welcome-screen/shared/interfaces/settings';
import ReliabilityState from '@ff-app/welcome-screen/shared/recoil/atoms/reliability';
import React from 'react';
import { CSSTransition } from 'react-transition-group';
import { useRecoilState } from 'recoil';

const Reliability: React.FC = () => {
  const [state, setState] = useRecoilState(ReliabilityState);

  const digestFrequencyOptions: Options<DigestFrequency> = [
    { value: DigestFrequency.Daily, label: 'Daily' },
    { value: DigestFrequency.WeeklySundays, label: 'Weekly - Sundays' },
    { value: DigestFrequency.WeeklyMondays, label: 'Weekly - Mondays' },
    { value: DigestFrequency.WeeklyTuesdays, label: 'Weekly - Tuesdays' },
    { value: DigestFrequency.WeeklyWednesdays, label: 'Weekly - Wednesdays' },
    { value: DigestFrequency.WeeklyThursdays, label: 'Weekly - Thursdays' },
    { value: DigestFrequency.WeeklyFridays, label: 'Weekly - Fridays' },
    { value: DigestFrequency.WeeklySaturdays, label: 'Weekly - Saturdays' },
  ];

  return (
    <div>
      <Heading>Reliability Protection</Heading>
      <Paragraph>
        Reliability is an extremely important part of Freeform's offerings. We know that submissions and leads that fall
        through the cracks can be very costly. To help protect you against this, Freeform offers some built-in tools to
        help you keep your finger on the pulse of your website and catch issues sooner or even before they happen!
      </Paragraph>

      <FormWrapper>
        <TextField
          description="Which email address should Freeform send email alerts for failed email notifications?"
          value={state.errorRecipients}
          onChange={(event): void => {
            setState((originalState) => ({
              ...originalState,
              errorRecipients: event.target.value,
            }));
          }}
        />

        <LightSwitchField
          description="Would you like Freeform to automatically check for important updates and bug fixes that specifically affect this website? Update warnings and notices will be displayed in the Freeform Dashboard and also sent through the Digest email (if enabled)."
          value={state.updateNotices}
          onChange={(value): void => {
            setState((oldState) => ({
              ...oldState,
              updateNotices: value,
            }));
          }}
        />

        <TextField
          description="Which email address should Freeform send Developer Digest emails to? This includes a snapshot of the previous period’s performance and any logged errors and upgrade notices."
          value={state.digestRecipients}
          onChange={(event): void => {
            setState((originalState) => ({
              ...originalState,
              digestRecipients: event.target.value,
            }));
          }}
        />

        <CSSTransition mountOnEnter unmountOnExit in={!!state.digestRecipients} timeout={300} classNames="animation">
          <SelectField
            description="How often should Freeform send these Developer Digest emails?"
            value={state.digestFrequency}
            options={digestFrequencyOptions}
            onChange={(event): void => {
              setState((oldState) => ({
                ...oldState,
                digestFrequency: event.target.value as DigestFrequency,
              }));
            }}
          />
        </CSSTransition>

        <TextField
          description="Would you like Freeform to send a client-friendly Stats-only Digest email to the client’s email address as well?"
          value={state.clientDigestRecipients}
          onChange={(event): void => {
            setState((originalState) => ({
              ...originalState,
              clientDigestRecipients: event.target.value,
            }));
          }}
        />

        <CSSTransition
          mountOnEnter
          unmountOnExit
          in={!!state.clientDigestRecipients}
          timeout={300}
          classNames="animation"
        >
          <SelectField
            description="How often should Freeform send these Stats Digest emails?"
            value={state.clientDigestFrequency}
            options={digestFrequencyOptions}
            onChange={(event): void => {
              setState((oldState) => ({
                ...oldState,
                clientDigestFrequency: event.target.value as DigestFrequency,
              }));
            }}
          />
        </CSSTransition>

        <LightSwitchField
          description="Should Freeform send these Digest notifications on production environments only?"
          value={state.digestProductionOnly}
          onChange={(value): void => {
            setState((oldState) => ({
              ...oldState,
              digestProductionOnly: value,
            }));
          }}
        />
      </FormWrapper>
    </div>
  );
};

export default Reliability;
