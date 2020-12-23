import { atom } from 'recoil';

export enum DefaultView {
  Dashboard = 'dashboard',
  Forms = 'forms',
  Submissions = 'submissions',
}
export enum FormattingTemplate {
  Flexbox = 'flexbox',
}
export enum JSInsertLocation {
  Footer = 'footer',
  Form = 'form',
  None = 'none',
}

interface GeneralInterface {
  name: string;
  defaultView: DefaultView;
  ajax: boolean;
  defaultFormattingTemplate: FormattingTemplate;
  disableSubmit: boolean;
  autoScroll: boolean;
  jsInsertLocation: JSInsertLocation;
}

const generalState = atom<GeneralInterface>({
  key: 'general',
  default: {
    name: 'Freeform',
    defaultView: DefaultView.Dashboard,
    ajax: true,
    defaultFormattingTemplate: FormattingTemplate.Flexbox,
    disableSubmit: true,
    autoScroll: true,
    jsInsertLocation: JSInsertLocation.Footer,
  },
});

export default generalState;
