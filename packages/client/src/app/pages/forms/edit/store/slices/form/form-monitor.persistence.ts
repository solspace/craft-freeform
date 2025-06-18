import type { UpdatedSubscriber } from '@editor/store/middleware/state-persist';
import { TOPIC_UPSERTED } from '@editor/store/middleware/state-persist';

import { integrationSelectors } from '../integrations/integrations.selectors';

import { formActions } from '.';

const handleFormMonitorState: UpdatedSubscriber = (
  _,
  { getState, dispatch }
) => {
  const state = getState();
  const formMonitor = integrationSelectors.oneByShortName('FormMonitor')(state);
  if (!formMonitor) {
    return;
  }

  dispatch(
    formActions.update({
      formMonitor: formMonitor.enabled,
    })
  );
};

PubSub.subscribe(TOPIC_UPSERTED, handleFormMonitorState);
