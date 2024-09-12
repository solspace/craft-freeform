import React, { useEffect } from 'react';
import config, { Edition } from '@config/freeform/freeform.config';
import { useQueryFormsWithStats } from '@ff-client/queries/forms';
import translate from '@ff-client/utils/translations';

import { Notices } from '../../notices/notices';
import { Archived } from '../grid/archived/archived';
import { ArchivedAndGroupWrapper, ContentContainer } from '../grid/grid.styles';

import { Wrapper } from './list.styles';
import { ListTable } from './list.table';

export const FormList: React.FC = () => {
  const { data, isFetching } = useQueryFormsWithStats();
  const isAtLeastLite = config.editions.isAtLeast(Edition.Lite);

  const forms = data?.filter(({ dateArchived }) => dateArchived === null);
  const archivedForms = data?.filter(
    ({ dateArchived }) => dateArchived !== null
  );

  useEffect(() => {
    document.title = translate('Forms');
  }, []);

  return (
    <ContentContainer>
      <div id="content" className="content-pane">
        <Notices />

        <Wrapper>
          <ListTable forms={forms} isFetching={isFetching} />

          {isAtLeastLite && (
            <ArchivedAndGroupWrapper>
              <Archived data={archivedForms} />
            </ArchivedAndGroupWrapper>
          )}
        </Wrapper>
      </div>
    </ContentContainer>
  );
};
