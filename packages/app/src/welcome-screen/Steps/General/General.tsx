import FormWrapper from '@ff-app/welcome-screen/shared/components/form/FormWrapper';
import LightSwitchField from '@ff-app/welcome-screen/shared/components/form/LightSwitchField/LightSwitchField';
import SelectField, { Options } from '@ff-app/welcome-screen/shared/components/form/SelectField/SelectField';
import TextField from '@ff-app/welcome-screen/shared/components/form/TextField/TextField';
import Heading from '@ff-app/welcome-screen/shared/components/Typography/Heading/Heading';
import Paragraph from '@ff-app/welcome-screen/shared/components/Typography/Paragraph/Paragraph';
import { Italics } from '@ff-app/welcome-screen/shared/components/Typography/Typography.styles';
import GeneralState from '@ff-app/welcome-screen/shared/recoil/atoms/general';
import settingDefaults from '@ff-app/welcome-screen/shared/requests/default-data';
import {
  DefaultView,
  FormattingTemplate,
  JSInsertLocation,
  JSInsertType,
  SessionType,
} from '@ff-welcome-screen/shared/interfaces/settings';
import React from 'react';
import { useRecoilState } from 'recoil';

const isPro = settingDefaults.settings.freeform.pro;

const General: React.FC = () => {
  const [state, setState] = useRecoilState(GeneralState);
  const canInsertPointers = settingDefaults.general.canInsertPointers;

  const defaultViewOptions: Options<DefaultView> = [
    { value: DefaultView.Dashboard, label: 'Dashboard' },
    { value: DefaultView.Forms, label: 'Forms' },
    { value: DefaultView.Submissions, label: 'Submissions' },
  ];

  const formattingTemplateOptions: Options<FormattingTemplate> = [
    { value: FormattingTemplate.BasicLight, label: 'Basic Light' },
    { value: FormattingTemplate.BasicDark, label: 'Basic Dark' },
    { value: FormattingTemplate.BasicFloatingLabels, label: 'Basic Floating Labels' },
    { value: FormattingTemplate.Conversational, label: 'Conversational' },
    { value: FormattingTemplate.MultipageAllFields, label: 'Multipage All Fields' },
    { value: FormattingTemplate.Bootstrap4, label: 'Bootstrap 4' },
    { value: FormattingTemplate.Bootstrap5, label: 'Bootstrap 5' },
    { value: FormattingTemplate.Bootstrap5Dark, label: 'Bootstrap 5 Dark' },
    { value: FormattingTemplate.Bootstrap5Floating, label: 'Bootstrap 5 Floating labels' },
    { value: FormattingTemplate.Tailwind3, label: 'Tailwind 3' },
    { value: FormattingTemplate.Foundation6, label: 'Foundation 6' },
    { value: FormattingTemplate.Flexbox, label: 'Flexbox' },
    { value: FormattingTemplate.Grid, label: 'Grid' },
  ];

  const jsInsertLocationOptions: Options<JSInsertLocation> = [
    { value: JSInsertLocation.Footer, label: 'Footer (recommended)' },
    { value: JSInsertLocation.Form, label: 'Form' },
    { value: JSInsertLocation.Manual, label: 'Manual' },
  ];

  const jsInsertTypeOptions: Options<JSInsertType> = [
    {
      value: JSInsertType.Pointers,
      label: `As Static URLs${canInsertPointers ? ' (recommended)' : ' (not supported on your system)'}`,
    },
    { value: JSInsertType.Files, label: `As Files${!canInsertPointers ? ' (recommended)' : ''}` },
    { value: JSInsertType.Inline, label: 'Inline' },
  ];

  const sessionTypeOptions: Options<SessionType> = [
    { value: SessionType.Payload, label: 'As an encrypted payload (recommended)' },
    { value: SessionType.PHPSessions, label: "Using PHP's sessions" },
    { value: SessionType.Database, label: 'Using a database table' },
  ];

  return (
    <div>
      <Heading>General Setup</Heading>
      <Paragraph>
        Freeform includes a wide variety of settings that allow you to customize your form management experience. These
        can later be adjusted by going to the{' '}
        <Italics>
          Freeform {'->'} Settings {'->'} General Settings
        </Italics>{' '}
        page. The following are defaulted to what's recommended...
      </Paragraph>

      <FormWrapper>
        {isPro && (
          <TextField
            description="Rename the plugin name to something more intuitive for your clients (optional)"
            value={state.name}
            onChange={(event): void => {
              setState((originalState) => ({
                ...originalState,
                name: event.target.value,
              }));
            }}
          />
        )}

        <SelectField
          description="Which page should be loaded when you click on the Freeform link in the CP nav?"
          value={state.defaultView}
          options={defaultViewOptions}
          onChange={(event): void => {
            setState((oldState) => ({
              ...oldState,
              defaultView: event.target.value as DefaultView,
            }));
          }}
        />

        <LightSwitchField
          description="Would you like to have built-in AJAX enabled by default for all forms?"
          value={state.ajax}
          onChange={(value): void => {
            setState((oldState) => ({
              ...oldState,
              ajax: value,
            }));
          }}
        />

        <SelectField
          description="What would you like your default Formatting Template for each form to be?"
          value={state.defaultFormattingTemplate}
          options={formattingTemplateOptions}
          onChange={(event): void => {
            setState((oldState) => ({
              ...oldState,
              defaultFormattingTemplate: event.target.value as FormattingTemplate,
            }));
          }}
        />

        <LightSwitchField
          description="Would you like Freeform to automatically disable the Submit button when someone clicks a form to submit it (preventing duplicate clicks)?"
          value={state.disableSubmit}
          onChange={(value): void => {
            setState((oldState) => ({
              ...oldState,
              disableSubmit: value,
            }));
          }}
        />

        <LightSwitchField
          description="Would you like Freeform to automatically scroll to the page to the form when errors are trigger or multipage forms are used?"
          value={state.autoScroll}
          onChange={(value): void => {
            setState((oldState) => ({
              ...oldState,
              autoScroll: value,
            }));
          }}
        />

        <SelectField
          description="Where would you like Freeform to insert its scripts in your templates that load forms?"
          value={state.jsInsertLocation}
          options={jsInsertLocationOptions}
          onChange={(event): void => {
            setState((oldState) => ({
              ...oldState,
              jsInsertLocation: event.target.value as JSInsertLocation,
            }));
          }}
        />

        <SelectField
          description="How should Freeform insert its scripts in your templates that load forms?"
          value={state.jsInsertType}
          options={jsInsertTypeOptions}
          onChange={(event): void => {
            setState((oldState) => ({
              ...oldState,
              jsInsertType: event.target.value as JSInsertType,
            }));
          }}
        />

        <SelectField
          description="How should form data be passed between form submits?"
          value={state.sessionType}
          options={sessionTypeOptions}
          onChange={(event): void => {
            setState((oldState) => ({
              ...oldState,
              sessionType: event.target.value as SessionType,
            }));
          }}
        />
      </FormWrapper>
    </div>
  );
};

export default General;
