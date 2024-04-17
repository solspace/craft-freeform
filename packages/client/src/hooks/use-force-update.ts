import { useEffect, useReducer } from 'react';

export const useForceUpdate = (): void => {
  // Most efficient way to force a re-render
  // https://reactjs.org/docs/hooks-faq.html#is-there-something-like-forceupdate
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  useEffect(() => {
    setTimeout(() => {
      forceUpdate();
    }, 0);
  }, []);
};
