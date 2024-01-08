import type { ReactNode } from 'react';
import React from 'react';
import classes from '@ff-client/utils/classes';

import { FieldGroupWrapper, GroupTitle } from './field-group.styles';

import 'react-loading-skeleton/dist/skeleton.css';

type FieldGroupProps = {
  title: string;
  disabled?: boolean;
  button?: {
    icon: ReactNode;
    title?: string;
    onClick?: () => void;
  };
  children?: ReactNode;
};

const FieldGroup: React.FC<FieldGroupProps> = ({
  title,
  disabled,
  button,
  children,
}) => {
  return (
    <FieldGroupWrapper className={classes(disabled && 'disabled')}>
      <GroupTitle>
        {title}
        {button && (
          <button type="button" title={button.title} onClick={button.onClick}>
            {button.icon}
          </button>
        )}
      </GroupTitle>
      {children}
    </FieldGroupWrapper>
  );
};

FieldGroup.displayName = 'FieldGroup';

type ManagerEditionProps<P extends FieldGroupProps> = Omit<P, 'button'> & {
  button?: FieldGroupProps['button'];
  editionIsPro?: boolean;
};

const withManagerEdition = <P extends FieldGroupProps>(
  Component: React.ComponentType<P>
): React.FC<ManagerEditionProps<P>> => {
  const WrappedComponent: React.FC<ManagerEditionProps<P>> = (props) => {
    const { editionIsPro, button, ...rest } = props;
    const restProps = rest as P;

    return (
      <Component {...restProps} button={editionIsPro ? button : undefined} />
    );
  };

  WrappedComponent.displayName = `withManagerEdition(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
};

const ManagerFieldGroup = withManagerEdition(FieldGroup);
ManagerFieldGroup.displayName = 'ManagerFieldGroup';

export { FieldGroup, ManagerFieldGroup };
