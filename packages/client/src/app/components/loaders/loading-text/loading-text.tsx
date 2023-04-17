import type { ComponentPropsWithRef } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import React from 'react';

import {
  useDotAnimation,
  useReverseTextAnimation,
  useSpinnerAnimation,
  useTextAnimation,
  useTextContainerAnimation,
} from './loading-text.animations';
import {
  Dot,
  DotContainer,
  LoadingTextContainer,
  LoadingTextWrapper,
  OriginalTextContainer,
  SpinnerContainer,
  TextContainer,
} from './loading-text.styles';
import SpinnerIcon from './spinner.svg';

type Props = ComponentPropsWithRef<'div'> & {
  loadingText?: string;
  loading?: boolean;
  spinner?: boolean;
  instant?: boolean;
};

export type Dimensions = {
  original: {
    width: number;
    height: number;
  };
  loading: {
    width: number;
  };
};

export const LoadingText: React.FC<Props> = ({
  children,
  loadingText,
  loading,
  spinner,
  instant,
  ...props
}) => {
  const textOriginalRef = React.useRef<HTMLSpanElement>(null);
  const textLoadingRef = React.useRef<HTMLSpanElement>(null);

  const [dimensions, setDimensions] = useState<Dimensions>({
    original: {
      width: undefined,
      height: undefined,
    },
    loading: {
      width: undefined,
    },
  });

  useEffect(() => {
    if (!textOriginalRef.current) return;

    const width = textOriginalRef.current.offsetWidth;
    const height = textOriginalRef.current.offsetHeight;
    const loadingWidth = textLoadingRef.current?.offsetWidth || width;

    setDimensions({
      original: { width, height },
      loading: { width: loadingWidth },
    });
  }, [textOriginalRef.current]);

  const spinnerAnimation = useSpinnerAnimation(loading, instant);
  const dotAnimation = useDotAnimation(loading, instant);
  const textAnimation = useTextAnimation(loading, loadingText, instant);
  const reverseTextAnimation = useReverseTextAnimation(loading, instant);
  const textContainerAnimation = useTextContainerAnimation(
    loading,
    loadingText,
    dimensions,
    instant
  );

  return (
    <LoadingTextWrapper {...props}>
      {spinner && (
        <SpinnerContainer style={spinnerAnimation}>
          <SpinnerIcon />
        </SpinnerContainer>
      )}

      <TextContainer style={textContainerAnimation}>
        {!!loadingText && (
          <LoadingTextContainer
            ref={textLoadingRef}
            style={reverseTextAnimation}
          >
            {loadingText}
          </LoadingTextContainer>
        )}

        <OriginalTextContainer ref={textOriginalRef} style={textAnimation}>
          {children}
        </OriginalTextContainer>
      </TextContainer>

      <DotContainer style={dotAnimation}>
        <Dot />
        <Dot />
        <Dot />
      </DotContainer>
    </LoadingTextWrapper>
  );
};
