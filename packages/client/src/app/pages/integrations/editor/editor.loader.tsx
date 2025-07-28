import type { FC } from 'react';
import React from 'react';
import Skeleton from 'react-loading-skeleton';

import { Icon, Title } from './titlebar/titlebar.styles.ts';
import { EditorWrapper } from './editor.styles';

export const EditorLoader: FC = () => {
  return (
    <EditorWrapper>
      <Title>
        <Icon className="spinning">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
            <path d="M320 180C291.3 180 268 156.7 268 128C268 99.3 291.3 76 320 76C348.7 76 372 99.3 372 128C372 156.7 348.7 180 320 180zM320 480C337.7 480 352 494.3 352 512C352 529.7 337.7 544 320 544C302.3 544 288 529.7 288 512C288 494.3 302.3 480 320 480zM512 352C494.3 352 480 337.7 480 320C480 302.3 494.3 288 512 288C529.7 288 544 302.3 544 320C544 337.7 529.7 352 512 352zM96 320C96 302.3 110.3 288 128 288C145.7 288 160 302.3 160 320C160 337.7 145.7 352 128 352C110.3 352 96 337.7 96 320zM495.4 223.8C473.5 245.7 438.1 245.7 416.2 223.8C394.3 201.9 394.3 166.5 416.2 144.6C438.1 122.7 473.5 122.7 495.4 144.6C517.3 166.5 517.3 201.9 495.4 223.8zM161.6 478.4C149.1 465.9 149.1 445.6 161.6 433.1C174.1 420.6 194.4 420.6 206.9 433.1C219.4 445.6 219.4 465.9 206.9 478.4C194.4 490.9 174.1 490.9 161.6 478.4zM433.1 478.4C420.6 465.9 420.6 445.6 433.1 433.1C445.6 420.6 465.9 420.6 478.4 433.1C490.9 445.6 490.9 465.9 478.4 478.4C465.9 490.9 445.6 490.9 433.1 478.4zM150.3 150.3C169.1 131.5 199.4 131.5 218.2 150.3C237 169.1 237 199.4 218.2 218.2C199.4 237 169.1 237 150.3 218.2C131.5 199.4 131.5 169.1 150.3 150.3z" />
          </svg>
        </Icon>
        <Skeleton width={200} />
      </Title>

      <div>
        <Skeleton width={100} />
        <Skeleton width={250} height={10} />
        <Skeleton width={'100%'} height={30} />
      </div>

      <div>
        <Skeleton width={80} />
        <Skeleton width={270} height={10} />
        <Skeleton width={'100%'} height={30} />
      </div>

      <hr />

      <div>
        <Skeleton width={200} baseColor="var(--blue-200)" />
      </div>

      <hr />

      <div>
        <Skeleton width={180} />
        <Skeleton width={200} height={10} />
        <Skeleton width={'100%'} height={30} />
      </div>

      <div>
        <Skeleton width={70} />
        <Skeleton width={340} height={10} />
        <Skeleton width={'100%'} height={30} />
      </div>
    </EditorWrapper>
  );
};
