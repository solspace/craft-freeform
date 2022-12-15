import React from 'react';
import { useParams } from 'react-router-dom';
import { FormControlGenerator } from '@components/form-controls/form-control-generator';
import { Sidebar } from '@components/layout/sidebar/sidebar';
import { useQueryFormSettings } from '@ff-client/queries/forms';

import { Group } from './group/group';
import {
  FormSettingsContainer,
  FormSettingsWrapper,
  GroupsCollection,
} from './form-settings.style';
import { useValueUpdateGenerator } from './use-value-update-generator';

type RouteParams = {
  namespace: string;
};

export const FormSettings: React.FC = () => {
  const { namespace } = useParams<RouteParams>();
  const { data, isFetching } = useQueryFormSettings();

  const generateUpdateHandler = useValueUpdateGenerator(namespace);

  if (!data && isFetching) {
    return <div>Loading...</div>;
  }

  const settingsNamespace = data.find((item) => item.handle === namespace);
  if (!settingsNamespace) {
    return null;
  }

  const { groups, properties } = settingsNamespace;

  return (
    <FormSettingsWrapper>
      <Sidebar></Sidebar>
      <FormSettingsContainer>
        <GroupsCollection>
          {[...groups, null].map((group, index) => {
            const filteredProperties = properties
              .filter((property) => {
                if (!group && !property.group) {
                  return true;
                }

                return group?.handle === property.group;
              })
              .sort((a, b) => a.order - b.order);

            if (!filteredProperties.length) {
              return null;
            }

            return (
              <Group key={index} group={group}>
                {filteredProperties.map((property) => (
                  <FormControlGenerator
                    key={property.handle}
                    namespace={namespace}
                    property={property}
                    onValueUpdate={generateUpdateHandler(property)}
                  />
                ))}
              </Group>
            );
          })}
        </GroupsCollection>
      </FormSettingsContainer>
    </FormSettingsWrapper>
  );
};
