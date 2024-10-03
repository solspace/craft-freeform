import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Sidebar } from '@components/layout/sidebar/sidebar';
import { pageSelecors } from '@editor/store/slices/layout/pages/pages.selectors';
import { useQueryFormRules } from '@ff-client/queries/rules';

import { useLastTab } from '../../tabs.hooks';

import { Page } from './page/page';
import { SubmitForm } from './submit/submit';
import { LoaderMiniMap } from './mini-map.loader';
import { MiniMapWrapper } from './mini-map.styles';

export const MiniMap: React.FC = () => {
  const { formId } = useParams();

  const { isFetching } = useQueryFormRules(Number(formId || 0));
  const pages = useSelector(pageSelecors.all);

  const { lastTab } = useLastTab('rules');
  const navigate = useNavigate();

  useEffect(() => {
    if (lastTab !== undefined) {
      navigate(lastTab);
    }
  }, []);

  return (
    <Sidebar>
      <MiniMapWrapper>
        {isFetching && <LoaderMiniMap />}
        {!isFetching &&
          pages.map((page) => <Page key={page.uid} page={page} />)}
        <SubmitForm />
      </MiniMapWrapper>
    </Sidebar>
  );
};
