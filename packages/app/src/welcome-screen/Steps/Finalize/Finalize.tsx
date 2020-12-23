import Heading from '@ff-app/welcome-screen/shared/components/Typography/Heading/Heading';
import Paragraph from '@ff-app/welcome-screen/shared/components/Typography/Paragraph/Paragraph';
import React from 'react';

const Finalize: React.FC = () => {
  return (
    <div>
      <Heading>Applying your preferences</Heading>
      <Paragraph>
        <ul>
          <li>Applying General Setup preferences...</li>
          <li>Applying Spam Protection preferences...</li>
          <li>Applying Reliability Protection preferences...</li>
        </ul>

        <div>Finished!</div>
      </Paragraph>
    </div>
  );
};

export default Finalize;
