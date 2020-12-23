import { atom } from 'recoil';

export enum DigestFrequency {
  Weekly = 'weekly',
  Monthly = 'monthly',
}

interface ReliabilityInterface {
  errorRecipients: string;
  updateNotices: boolean;
  digestRecipients: string;
  digestFrequency: DigestFrequency;
  clientDigestRecipients: string;
  clientDigestFrequency: DigestFrequency;
  digestProductionOnly: boolean;
}

const reliabilityState = atom<ReliabilityInterface>({
  key: 'reliability',
  default: {
    errorRecipients: '',
    updateNotices: true,
    digestRecipients: '',
    digestFrequency: DigestFrequency.Weekly,
    clientDigestRecipients: '',
    clientDigestFrequency: DigestFrequency.Weekly,
    digestProductionOnly: false,
  },
});

export default reliabilityState;
