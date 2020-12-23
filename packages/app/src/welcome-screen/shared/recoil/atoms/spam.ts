import { atom } from 'recoil';

export enum SpamBehaviour {
  SimulateSuccess = 'simulate_success',
  DisplayErrors = 'display_errors',
}

interface SpamInterface {
  honeypot: boolean;
  enhancedHoneypot: boolean;
  spamFolder: boolean;
  spamBehaviour: SpamBehaviour;
}

const spamState = atom<SpamInterface>({
  key: 'spam',
  default: {
    honeypot: true,
    enhancedHoneypot: false,
    spamFolder: true,
    spamBehaviour: SpamBehaviour.SimulateSuccess,
  },
});

export default spamState;
