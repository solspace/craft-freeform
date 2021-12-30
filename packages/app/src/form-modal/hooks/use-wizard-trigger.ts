import { useEffect } from 'react';

type Handler = (event: MouseEvent) => void;

export const useWizardTrigger = (handler: Handler): void => {
  useEffect(() => {
    const triggers = document.querySelectorAll<HTMLElement>('[data-create-form-wizard]');
    triggers.forEach((trigger) => trigger.addEventListener('click', handler));

    return (): void => triggers.forEach((trigger) => trigger.removeEventListener('click', handler));
  }, []);
};
