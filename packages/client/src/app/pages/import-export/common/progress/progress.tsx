import type { PropsWithChildren } from 'react';
import React from 'react';

import { useDoneAnimation, useProgressAnimation } from './progress.animations';
import { ProgressBar } from './progress.bar';
import type { ProgressEvent } from './progress.hooks';
import { Done, DoneWrapper, ProgressWrapper } from './progress.styles';

type Props = {
  label: string;
  finishLabel: string;
  event: ProgressEvent;
};

export const Progress: React.FC<PropsWithChildren<Props>> = ({
  label,
  finishLabel,
  event,
}) => {
  const {
    progress: { displayProgress, showDone, progress, total, info, errors },
  } = event;

  const progressAnimation = useProgressAnimation(displayProgress);
  const doneAnimation = useDoneAnimation(showDone);

  return (
    <div>
      <ProgressWrapper style={progressAnimation}>
        <ProgressBar
          width="60%"
          show
          value={progress[0]}
          max={total[0]}
          active={true}
        >
          {label}
        </ProgressBar>

        <ProgressBar
          width="60%"
          show
          variant="secondary"
          value={progress[1]}
          max={total[1]}
          active={true}
        >
          {info}
        </ProgressBar>
      </ProgressWrapper>

      {errors.length > 0 && (
        <ul className="errors">
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      )}

      <DoneWrapper style={doneAnimation}>
        <Done>
          <i className="fa-sharp fa-solid fa-check" />
          <span>{finishLabel}</span>
        </Done>
      </DoneWrapper>
    </div>
  );
};
