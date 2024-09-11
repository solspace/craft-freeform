import React from 'react';
import translate from '@ff-client/utils/translations';

import { useCreateFormModal } from '../../modals/hooks/use-create-form-modal';

export const ListEmpty: React.FC = () => {
  const openCreateFormModal = useCreateFormModal();

  return (
    <div>
      <p>
        {translate(
          `You don't have any forms yet. Create your first form now...`
        )}
      </p>

      <button className="btn submit add icon" onClick={openCreateFormModal}>
        {translate('New Form')}
      </button>
    </div>
  );
};
