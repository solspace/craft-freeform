import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QKForms } from '@ff-client/queries/forms';
import { QKIntegrations } from '@ff-client/queries/integrations';
import { QKNotifications } from '@ff-client/queries/notifications';
import { useQueryClient } from '@tanstack/react-query';

export const useFreeformNavigation = (): void => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const link = document.querySelector(
      `ul.subnav li a[href*="/freeform/forms"]`
    );

    const onClick = (event: MouseEvent): boolean => {
      event.preventDefault();

      if (formId) {
        queryClient.invalidateQueries(QKForms.single(Number(formId)));
        queryClient.invalidateQueries(QKNotifications.single(Number(formId)));
        queryClient.invalidateQueries(QKIntegrations.single(Number(formId)));
      }

      navigate('/forms');

      return false;
    };

    link.addEventListener('click', onClick);

    return () => {
      link.removeEventListener('click', onClick);
    };
  });
};
