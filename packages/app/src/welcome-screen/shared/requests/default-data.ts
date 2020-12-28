import { GeneralInterface, ReliabilityInterface, SpamInterface } from '../interfaces/settings';

interface Defaults {
  general: GeneralInterface;
  spam: SpamInterface;
  reliability: ReliabilityInterface;
}

const jsonData = document.getElementById('setting-defaults').innerHTML;
const settingDefaults: Defaults = JSON.parse(jsonData);

export default settingDefaults;
