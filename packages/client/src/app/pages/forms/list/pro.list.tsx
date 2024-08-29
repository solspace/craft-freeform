import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { useFetchFormGroups } from '@ff-client/queries/form-groups';
import translate from '@ff-client/utils/translations';
import EditIcon from '@ff-icons/actions/edit.svg';

import { Archived } from './archived/archived';
import { Card } from './card/card';
import { CardLoading } from './card/card.loading';
import { useCreateFormModal } from './modal/use-create-form-modal';
import { useEditGroupModal } from './modal/use-edit-group-modal';
import { Notices } from './notices/notices';
import { EmptyList } from './list.empty';
import { ListSites } from './list.sites';
import {
  ArchivedAndGroupWrapper,
  Button,
  Cards,
  CardWrapper,
  ContentContainer,
  GroupsButton,
  GroupTitle,
  GroupWrap,
  Header,
  Title,
  Wrapper,
} from './pro.list.styles';

export const ProList: React.FC = () => {
  const { data, isFetching } = useFetchFormGroups();
  const openCreateFormModal = useCreateFormModal();
  const openEditGroupModal = useEditGroupModal();

  const isForms = data?.forms.length > 0;
  const isGroups = data?.formGroups?.groups.some(
    (group) => group.forms.length > 0
  );
  const isEmpty = !isFetching && !isForms && !isGroups;

  return (
    <>
      <Header>
        <Title>{translate('Forms')}</Title>

        <ListSites />

        <Button className="btn submit add icon" onClick={openCreateFormModal}>
          {translate('Add new Form')}
        </Button>
      </Header>
      <ContentContainer>
        <div id="content" className="content-pane">
          <Notices />

          <Wrapper>
            {isEmpty && <EmptyList />}
            {!isEmpty && (
              <CardWrapper>
                {data?.formGroups?.groups.map((group) =>
                  group.forms.length ? (
                    <GroupWrap key={group.uid}>
                      <GroupTitle>{group.label}</GroupTitle>
                      <Cards>
                        {group.forms.map((form) => (
                          <Card isProEdition key={form.id} form={form} />
                        ))}
                      </Cards>
                    </GroupWrap>
                  ) : null
                )}

                {isForms && (
                  <GroupWrap>
                    {isGroups && <GroupTitle>Other</GroupTitle>}

                    <Cards>
                      {data.forms.map((form) => (
                        <Card isProEdition key={form.id} form={form} />
                      ))}
                    </Cards>
                  </GroupWrap>
                )}

                {!data?.forms && isFetching && (
                  <>
                    <Skeleton height={20} width={150} />

                    <Cards>
                      <CardLoading />
                      <CardLoading />
                      <CardLoading />
                    </Cards>
                  </>
                )}
              </CardWrapper>
            )}
            <ArchivedAndGroupWrapper>
              {data?.archivedForms && (
                <Archived isProEdition data={data.archivedForms} />
              )}

              {!isEmpty && (
                <GroupsButton
                  className="edit-groups"
                  onClick={openEditGroupModal}
                >
                  <EditIcon />
                  {translate('Form Groups')}
                </GroupsButton>
              )}
            </ArchivedAndGroupWrapper>
          </Wrapper>
        </div>
      </ContentContainer>
    </>
  );
};
