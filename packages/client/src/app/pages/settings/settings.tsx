import React, { useEffect } from 'react';

export const Settings: React.FC = () => {
  useEffect(() => {
    console.log('+++ settings');

    return () => {
      console.log('--- settings');
    };
  }, []);

  return <div>Settings</div>;
};
