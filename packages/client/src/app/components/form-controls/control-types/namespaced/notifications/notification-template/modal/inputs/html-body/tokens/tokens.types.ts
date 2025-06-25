import type { RootState } from '@editor/store';
import type { Suggestion } from '@ff-client/types/notifications';
import type { Store } from 'redux';

type CallbackRegister = (
  callback: (event: KeyboardEvent) => void,
  prepend?: boolean
) => void;

export type TokenBackend = {
  store: Store<RootState>;
  getRect: () => DOMRect | null;
  getRange: () => Range;
  insert: (item: Suggestion, filter: string) => void;
  extrnalTrigger?: boolean;
  handlers: {
    on: {
      down: CallbackRegister;
      up: CallbackRegister;
    };
    off: {
      down: CallbackRegister;
      up: CallbackRegister;
    };
  };
};
