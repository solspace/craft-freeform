import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useFreeformNavigation = (): void => {
  const navigate = useNavigate();

  useEffect(() => {
    const link = document.querySelector(
      `ul.subnav li a[href$="freeform/forms"]`
    );

    const onClick = (event: MouseEvent): boolean => {
      event.preventDefault();

      navigate('/forms');

      return false;
    };

    link.addEventListener('click', onClick);

    return () => {
      link.removeEventListener('click', onClick);
    };
  });
};
