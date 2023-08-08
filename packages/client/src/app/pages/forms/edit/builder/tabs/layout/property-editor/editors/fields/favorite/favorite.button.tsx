import React, { useEffect, useState } from 'react';
import { useSpring } from 'react-spring';
import type { Field } from '@editor/store/slices/layout/fields';
import { useClickOutside } from '@ff-client/hooks/use-click-outside';
import { useFieldType } from '@ff-client/queries/field-types';
import classes from '@ff-client/utils/classes';
import HeartFullIcon from '@ff-icons/heart-check.svg';
import HeartEmptyIcon from '@ff-icons/heart-empty.svg';

import { FavoriteForm } from './favorite.form';
import { useFavoritesMutation } from './favorite.queries';
import {
  Button,
  FavoriteButtonWrapper,
  IconBox,
  InfoBlock,
  PopUpWrapper,
} from './favorite.styles';

type Props = {
  field: Field;
};

export const FavoriteButton: React.FC<Props> = ({ field }) => {
  const type = useFieldType(field?.typeClass);

  const mutation = useFavoritesMutation();

  const [active, setActive] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    setActive(false);
    setHover(false);
    mutation.reset();
  }, [field?.uid]);

  const style = useSpring({
    to: {
      opacity: active ? 1 : 0,
      scale: active ? 1 : 1.1,
      rotate: active ? 0 : -10,
    },
    config: {
      tension: 700,
    },
  });

  const iconStyle = useSpring({
    to: {
      scale: hover ? 1.2 : 1,
    },
    config: {
      tension: 600,
      mass: 3,
    },
  });

  const ref = useClickOutside<HTMLDivElement>({
    callback: (): void => {
      setActive(false);
      setHover(false);
    },
    isEnabled: active,
  });

  if (!field?.uid) {
    return null;
  }

  return (
    <FavoriteButtonWrapper className={classes(active && 'active')} ref={ref}>
      <Button
        style={iconStyle}
        onClick={() => setActive(!active)}
        onMouseOver={() => setHover(true)}
        onMouseOut={() => setHover(false)}
      >
        {mutation.isSuccess && <HeartFullIcon />}
        {!mutation.isSuccess && <HeartEmptyIcon />}
      </Button>
      <PopUpWrapper style={style}>
        <IconBox />
        <InfoBlock>
          <FavoriteForm field={field} type={type} mutation={mutation} />
        </InfoBlock>
      </PopUpWrapper>
    </FavoriteButtonWrapper>
  );
};
