import { atom } from 'recoil';
import { SpamInterface } from '../../interfaces/settings';
import settingDefaults from '../../requests/default-data';

const SpamState = atom<SpamInterface>({
  key: 'spam',
  default: settingDefaults.spam,
});

export default SpamState;
