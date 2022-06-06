import React from 'react';

import { useAppDispatch } from '../../store/store';
import { Cell } from './cell/cell';
import { Wrapper } from './field-layout.styles';
import { Layout } from './layout/layout';
import { PageTabs } from './page-tabs/page-tabs';
import { Page } from './page/page';
import { Row } from './row/row';

export const FieldLayout: React.FC = () => {
  const dispatch = useAppDispatch();

  return (
    <Wrapper>
      <PageTabs />
      <Page>
        <Layout>
          <Row>
            <Cell />
            <Cell />
            <Layout>
              <Row>
                <Cell />
                <Cell />
                <Cell />
                <Cell />
              </Row>
              <Row />
            </Layout>
            <Cell />
          </Row>
          <Row />
        </Layout>
      </Page>
      <Page>
        <Layout>
          <Row />
        </Layout>
      </Page>
    </Wrapper>
  );
};
