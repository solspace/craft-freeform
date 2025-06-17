import type { UpdatedSubscriber } from '@editor/store/middleware/state-persist';
import { TOPIC_UPSERTED } from '@editor/store/middleware/state-persist';

import { formActions } from '.';

const handleFormMonitorState: UpdatedSubscriber = (
  _,
  { dispatch, response }
) => {
  if (!response.data?.formMonitor) {
    return;
  }

  dispatch(
    formActions.update({
      formMonitor: response.data.formMonitor,
    })
  );
};

PubSub.subscribe(TOPIC_UPSERTED, handleFormMonitorState);
