<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2022, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Services;

use craft\db\Query;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Events\Integrations\FetchMailingListTypesEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Database\MailingListHandlerInterface;
use Solspace\Freeform\Library\Exceptions\Integrations\ListNotFoundException;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\Types\MailingLists\AbstractMailingListIntegration;
use Solspace\Freeform\Library\Integrations\Types\MailingLists\DataObjects\ListObject;
use Solspace\Freeform\Models\MailingListModel;
use Solspace\Freeform\Records\IntegrationRecord;
use Solspace\Freeform\Records\MailingListFieldRecord;
use Solspace\Freeform\Records\MailingListRecord;

class MailingListsService extends AbstractIntegrationService implements MailingListHandlerInterface
{
    private static ?array $integrations = null;

    /**
     * Updates the mailing lists of a given mailing list integration.
     *
     * @param ListObject[] $mailingLists
     */
    public function updateLists(AbstractMailingListIntegration $integration, array $mailingLists): bool
    {
        $resourceIds = [];
        foreach ($mailingLists as $mailingList) {
            $resourceIds[] = $mailingList->getId();
        }

        $id = $integration->getId();
        $existingResourceIds = (new Query())
            ->select(['resourceId'])
            ->from(MailingListRecord::TABLE)
            ->where(['integrationId' => $id])
            ->column()
        ;

        $removableResourceIds = array_diff($existingResourceIds, $resourceIds);
        $addableIds = array_diff($resourceIds, $existingResourceIds);
        $updatableIds = array_intersect($resourceIds, $existingResourceIds);

        foreach ($removableResourceIds as $resourceId) {
            // PERFORM DELETE
            \Craft::$app
                ->getDb()
                ->createCommand()
                ->delete(
                    MailingListRecord::TABLE,
                    'integrationId = :integrationId AND resourceId = :resourceId',
                    [
                        'integrationId' => $id,
                        'resourceId' => $resourceId,
                    ]
                )
                ->execute()
            ;
        }

        foreach ($mailingLists as $mailingList) {
            // PERFORM INSERT
            if (\in_array($mailingList->getId(), $addableIds, true)) {
                $record = new MailingListRecord();
                $record->integrationId = $id;
                $record->resourceId = $mailingList->getId();
                $record->name = $mailingList->getName();
                $record->memberCount = $mailingList->getMemberCount();
                $record->save();
            }

            // PERFORM UPDATE
            if (\in_array($mailingList->getId(), $updatableIds, true)) {
                \Craft::$app
                    ->getDb()
                    ->createCommand()
                    ->update(
                        MailingListRecord::TABLE,
                        [
                            'name' => $mailingList->getName(),
                            'memberCount' => $mailingList->getMemberCount(),
                        ],
                        [
                            'integrationId' => $id,
                            'resourceId' => $mailingList->getId(),
                        ]
                    )
                    ->execute()
                ;
            }
        }

        $this->updateListFields($mailingLists);

        // Remove ForceUpdate flag
        \Craft::$app
            ->getDb()
            ->createCommand()
            ->update(
                IntegrationRecord::TABLE,
                ['forceUpdate' => 0],
                ['id' => $id]
            )
            ->execute()
        ;

        return true;
    }

    /**
     * Returns all ListObjects of a particular mailing list integration.
     *
     * @return ListObject[]
     */
    public function getLists(AbstractMailingListIntegration $integration): array
    {
        $data = (new Query())
            ->select(['id', 'resourceId', 'name', 'memberCount'])
            ->from(MailingListRecord::TABLE)
            ->where(['integrationId' => $integration->getId()])
            ->orderBy(['name' => 'ASC', 'dateCreated' => 'ASC'])
            ->all()
        ;

        $lists = [];
        foreach ($data as $item) {
            $fieldData = (new Query())
                ->select(['handle', 'label', 'type', 'required'])
                ->from(MailingListFieldRecord::TABLE)
                ->where(['mailingListId' => $item['id']])
                ->orderBy('dateCreated ASC')
                ->all()
            ;

            $fields = [];
            foreach ($fieldData as $fieldItem) {
                $fields[] = new FieldObject(
                    $fieldItem['handle'],
                    $fieldItem['label'],
                    $fieldItem['type'],
                    $fieldItem['required']
                );
            }

            $lists[] = new ListObject(
                $integration,
                $item['resourceId'],
                $item['name'],
                $fields,
                $item['memberCount']
            );
        }

        return $lists;
    }

    /**
     * @param int $id
     *
     * @throws ListNotFoundException
     */
    public function getListById(AbstractMailingListIntegration $integration, $id): ListObject
    {
        $data = $this->getMailingListQuery()
            ->where([
                'list.resourceId' => $id,
                'list.integrationId' => $integration->getId(),
            ])
            ->one()
        ;

        if (!$data) {
            throw new ListNotFoundException(
                Freeform::t(
                    'Could not find a list by ID "{id}" in {serviceProvider}',
                    [
                        'id' => $id,
                        'serviceProvider' => $integration->getServiceProvider(),
                    ]
                )
            );
        }

        $model = $this->createMailingListModel($data);

        return new ListObject(
            $integration,
            $model->resourceId,
            $model->name,
            $model->getFieldObjects(),
            $model->memberCount
        );
    }

    public function getAllServiceProviders(): array
    {
        if (null === self::$integrations) {
            $event = new FetchMailingListTypesEvent();
            $this->trigger(self::EVENT_FETCH_TYPES, $event);
            $types = $event->getTypes();
            usort($types, fn (Type $a, Type $b) => strcmp($a->name, $b->name));

            $integrations = [];
            foreach ($types as $type) {
                $integrations[$type->class] = $type;
            }

            self::$integrations = $integrations;
        }

        return self::$integrations;
    }

    /**
     * {@inheritdoc}
     */
    protected function getIntegrationType(): string
    {
        return IntegrationRecord::TYPE_MAILING_LIST;
    }

    /**
     * @param ListObject[] $mailingLists
     */
    private function updateListFields(array $mailingLists)
    {
        $metadata = (new Query())
            ->select(['id', 'resourceId'])
            ->from(MailingListRecord::TABLE)
            ->all()
        ;

        $mailingListIds = [];
        foreach ($metadata as $item) {
            $mailingListIds[$item['resourceId']] = $item['id'];
        }

        foreach ($mailingLists as $mailingList) {
            // Getting the database ID based on mailing list resource ID
            $mailingListId = $mailingListIds[$mailingList->getId()];

            $fields = $mailingList->getFields();
            $fieldHandles = [];
            foreach ($fields as $field) {
                $fieldHandles[] = $field->getHandle();
            }

            $existingFieldHandles = (new Query())
                ->select(['handle'])
                ->from(MailingListFieldRecord::TABLE)
                ->where(['mailingListId' => $mailingListId])
                ->column()
            ;

            $removableFieldHandles = array_diff($existingFieldHandles, $fieldHandles);
            $addableFieldHandles = array_diff($fieldHandles, $existingFieldHandles);
            $updatableFieldHandles = array_intersect($fieldHandles, $existingFieldHandles);

            foreach ($removableFieldHandles as $handle) {
                // PERFORM DELETE
                \Craft::$app
                    ->getDb()
                    ->createCommand()
                    ->delete(
                        MailingListFieldRecord::TABLE,
                        [
                            'mailingListId' => $mailingListId,
                            'handle' => $handle,
                        ]
                    )
                    ->execute()
                ;
            }

            foreach ($fields as $field) {
                // PERFORM INSERT
                if (\in_array($field->getHandle(), $addableFieldHandles, true)) {
                    $record = new MailingListFieldRecord();
                    $record->mailingListId = $mailingListId;
                    $record->handle = $field->getHandle();
                    $record->label = $field->getLabel();
                    $record->type = $field->getType();
                    $record->required = $field->isRequired();
                    $record->save();
                }

                // PERFORM UPDATE
                if (\in_array($field->getHandle(), $updatableFieldHandles, true)) {
                    \Craft::$app
                        ->getDb()
                        ->createCommand()
                        ->update(
                            MailingListFieldRecord::TABLE,
                            [
                                'handle' => $field->getHandle(),
                                'label' => $field->getLabel(),
                                'type' => $field->getType(),
                                'required' => $field->isRequired() ? 1 : 0,
                            ],
                            [
                                'mailingListId' => $mailingListId,
                                'handle' => $field->getHandle(),
                            ]
                        )
                        ->execute()
                    ;
                }
            }
        }
    }

    private function createMailingListModel(array $data): MailingListModel
    {
        return new MailingListModel($data);
    }

    private function getMailingListQuery(): Query
    {
        return (new Query())
            ->select(
                [
                    'list.id',
                    'list.integrationId',
                    'list.resourceId',
                    'list.name',
                    'list.memberCount',
                ]
            )
            ->from(MailingListRecord::TABLE.'list')
            ->orderBy(['id' => \SORT_ASC])
        ;
    }
}
