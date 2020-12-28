import { atom } from 'recoil';
import { GeneralInterface } from '../../interfaces/settings';
import settingDefaults from '../../requests/default-data';

const GeneralState = atom<GeneralInterface>({
  key: 'general',
  default: settingDefaults.general,
});

export default GeneralState;
