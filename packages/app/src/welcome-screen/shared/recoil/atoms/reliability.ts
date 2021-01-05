import { atom } from 'recoil';
import { ReliabilityInterface } from '../../interfaces/settings';
import settingDefaults from '../../requests/default-data';

const ReliabilityState = atom<ReliabilityInterface>({
  key: 'reliability',
  default: settingDefaults.reliability,
});

export default ReliabilityState;
