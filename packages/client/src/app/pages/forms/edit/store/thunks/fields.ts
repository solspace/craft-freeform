import change from './fields/change';
import moveExistingFieldThunks from './fields/move/existing';
import moveNewFieldThunks from './fields/move/new';
import remove from './fields/remove';

export const fieldThunks = {
  move: {
    newField: moveNewFieldThunks,
    existingField: moveExistingFieldThunks,
  },
  remove,
  change,
};
