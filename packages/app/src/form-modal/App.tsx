import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { usePortal } from './components/Modal/hooks/use-portal';
import { Modal } from './components/Modal/Modal';
import { useScrollDisable } from './hooks/use-scroll-disable';
import { FormOptionsContext } from './context/form-types-context';
import { useFormOptions } from './hooks/use-form-options';
import { useWizardTrigger } from './hooks/use-wizard-trigger';

const App: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const portalContainer = usePortal();
  const setScrollingDisabled = useScrollDisable();

  const [types, statuses, templates] = useFormOptions();

  const closeModal = (): void => {
    setScrollingDisabled(false);
    setModalOpen(false);
  };

  const loadModal = (): void => {
    setScrollingDisabled(true);
    setModalOpen(true);
  };

  useWizardTrigger(loadModal);

  return (
    <FormOptionsContext.Provider value={{ types, statuses, templates }}>
      {modalOpen ? createPortal(<Modal closeHandler={closeModal} />, portalContainer) : null}
    </FormOptionsContext.Provider>
  );
};

export default App;
