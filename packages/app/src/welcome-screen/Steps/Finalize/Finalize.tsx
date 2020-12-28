import Heading from '@ff-app/welcome-screen/shared/components/Typography/Heading/Heading';
import Paragraph from '@ff-app/welcome-screen/shared/components/Typography/Paragraph/Paragraph';
import { Italics } from '@ff-app/welcome-screen/shared/components/Typography/Typography.styles';
import GeneralState from '@ff-app/welcome-screen/shared/recoil/atoms/general';
import ReliabilityState from '@ff-app/welcome-screen/shared/recoil/atoms/reliability';
import SpamState from '@ff-app/welcome-screen/shared/recoil/atoms/spam';
import { push } from '@ff-app/welcome-screen/shared/requests/push-data';
import React, { useEffect, useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import { useRecoilValue } from 'recoil';
import { Finished, Label, ProgressItem, Tick, Wrapper } from './Finalize.styles';

interface Props {
  successCallback: () => void;
}
const Finalize: React.FC<Props> = ({ successCallback }) => {
  const generalState = useRecoilValue(GeneralState);
  const spamState = useRecoilValue(SpamState);
  const reliabilityState = useRecoilValue(ReliabilityState);

  const [generalDone, setGeneralDone] = useState(false);
  const [spamDone, setSpamDone] = useState(false);
  const [reliabilityDone, setReliabilityDone] = useState(false);

  useEffect(() => {
    const pushData = async (): Promise<void> => {
      await push('/api/settings/general', generalState);
      setGeneralDone(true);

      await push('/api/settings/spam', spamState);
      setSpamDone(true);

      await push('/api/settings/reliability', reliabilityState);
      setReliabilityDone(true);

      successCallback();
    };

    pushData();
  }, []);

  return (
    <div>
      <Heading>Applying your preferences</Heading>
      <Paragraph>
        <Wrapper>
          <ProgressItem>
            <Tick ticked={generalDone} />
            <Label>
              <Italics>
                Applying <b>General Setup</b> preferences...
              </Italics>
            </Label>
          </ProgressItem>

          <ProgressItem>
            <Tick ticked={spamDone} />
            <Label>
              <Italics>
                Applying <b>Spam Protection</b> preferences...
              </Italics>
            </Label>
          </ProgressItem>

          <ProgressItem>
            <Tick ticked={reliabilityDone} />
            <Label>
              <Italics>
                Applying <b>Reliability Protection</b> preferences...
              </Italics>
            </Label>
          </ProgressItem>
        </Wrapper>

        <CSSTransition mountOnEnter in={generalDone && spamDone && reliabilityDone} timeout={500}>
          <Finished>Finished!</Finished>
        </CSSTransition>
      </Paragraph>
    </div>
  );
};

export default Finalize;
