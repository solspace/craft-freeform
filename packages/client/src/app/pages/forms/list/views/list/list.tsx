import React, { useEffect } from 'react';
import config, { Edition } from '@config/freeform/freeform.config';
import { useFetchFormGroups } from '@ff-client/queries/form-groups';
import translate from '@ff-client/utils/translations';

import { Notices } from '../../notices/notices';
import { Archived } from '../grid/archived/archived';
import { ArchivedAndGroupWrapper, ContentContainer } from '../grid/grid.styles';

import { ListEmpty } from './list.empty';
import { Wrapper } from './list.styles';
import { ListTable } from './list.table';

export const FormList: React.FC = () => {
  const { data, isFetching } = useFetchFormGroups();

  const isForms = data?.forms.length > 0;
  const isGroups = data?.formGroups?.groups.some(
    (group) => group.forms.length > 0
  );
  const isEmpty = !isFetching && !isForms && !isGroups;
  const isExpressEdition = config.editions.is(Edition.Express);

  useEffect(() => {
    document.title = translate('Forms');
  }, []);

  return (
    <ContentContainer>
      <div id="content" className="content-pane">
        <Notices />

        <Wrapper>
          {!isEmpty && <ListTable forms={data?.forms} />}
          {isEmpty && <ListEmpty />}

          <ArchivedAndGroupWrapper>
            {!isExpressEdition && data?.archivedForms && (
              <Archived data={data.archivedForms} />
            )}
          </ArchivedAndGroupWrapper>
        </Wrapper>
      </div>
    </ContentContainer>
  );
};
