import type { ErrorsSubscriber } from '@editor/store/middleware/state-persist';
import {
  TOPIC_ERRORS,
  TOPIC_UPSERTED,
} from '@editor/store/middleware/state-persist';

import { fieldActions } from '.';

// const persistFields: SaveSubscriber = (_, data) => {
//   const { state, persist } = data;

//   persist.fields = state.layout.fields;
// };

const handleErrors: ErrorsSubscriber = (_, { dispatch, response }) => {
  dispatch(fieldActions.clearErrors());
  dispatch(fieldActions.setErrors(response.errors?.fields));
};

const handleUpserted: ErrorsSubscriber = (_, { dispatch }) => {
  dispatch(fieldActions.clearErrors());
};

//PubSub.subscribe(TOPIC_SAVE, persistFields);
PubSub.subscribe(TOPIC_ERRORS, handleErrors);
PubSub.subscribe(TOPIC_UPSERTED, handleUpserted);
