import { useEffect, useState } from 'react';

type DisableScrollingHandler = (disabled: boolean) => void;

export const useScrollDisable = (): DisableScrollingHandler => {
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isDisabled ? 'hidden' : 'auto';

    return (): void => {
      document.body.style.overflow = 'auto';
    };
  }, [isDisabled]);

  return setIsDisabled;
};
