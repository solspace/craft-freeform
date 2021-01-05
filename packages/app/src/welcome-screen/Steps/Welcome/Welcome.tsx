import Heading from '@ff-app/welcome-screen/shared/components/Typography/Heading/Heading';
import Paragraph from '@ff-app/welcome-screen/shared/components/Typography/Paragraph/Paragraph';
import React from 'react';

const Welcome: React.FC = () => {
  return (
    <div>
      <Heading>Welcome to Freeform!</Heading>

      <Paragraph>
        <em>Thank you for choosing Freeform, the most reliable form builder for Craft!</em> We know you have options,
        and greatly appreciate that you've chosen Freeform for this project.
      </Paragraph>

      <Paragraph>
        To streamline and guide you through your initial setup of Freeform, we've included a fast and easy way to review
        and adjust most Freeform settings in this post-install wizard. To proceed, click <em>Continue</em>. If you'd
        like to skip this, just click the <em>Skip All</em> button below.
      </Paragraph>
    </div>
  );
};

export default Welcome;
