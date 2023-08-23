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

namespace Solspace\Freeform\Services\Integrations;

use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Library\Integrations\Types\MailingLists\DataObjects\ListObject;
use Solspace\Freeform\Library\Integrations\Types\MailingLists\MailingListIntegrationInterface;
use Solspace\Freeform\Records\MailingListFieldRecord;
use Solspace\Freeform\Records\MailingListRecord;

class MailingListsService extends AbstractIntegrationService
{
    public function getListObjectById(?int $id): ?ListObject
    {
        $record = MailingListRecord::findOne(['id' => $id]);
        if (!$record) {
            return null;
        }

        return new ListObject(
            $record->resourceId,
            $record->name,
            $record->memberCount,
            $record->id,
        );
    }

    /**
     * @return ListObject[]
     */
    public function getLists(
        MailingListIntegrationInterface $integration,
        bool $refresh = false
    ): array {
        $existingRecords = MailingListRecord::find()
            ->where(['integrationId' => $integration->getId()])
            ->indexBy('handle')
            ->all()
        ;

        $client = $this->clientProvider->getAuthorizedClient($integration);

        if ($refresh || empty($existingRecords)) {
            $lists = $integration->fetchLists($client);

            $usedIds = [];
            $newLists = [];
            foreach ($lists as $list) {
                if (!\array_key_exists($list->getResourceId(), $existingRecords)) {
                    $newLists[] = $list;
                }

                $usedIds[] = $list->getResourceId();
            }

            foreach ($newLists as $list) {
                $record = new MailingListRecord();
                $record->integrationId = $integration->getId();
                $record->resourceId = $list->getResourceId();
                $record->name = $list->getName();
                $record->memberCount = $list->getMemberCount();
                $record->save();
            }

            foreach ($existingRecords as $handle => $record) {
                if (!\in_array($handle, $usedIds, true)) {
                    $record->delete();
                }
            }

            return $lists;
        }

        return array_map(
            fn (MailingListRecord $record) => new ListObject(
                $record->resourceId,
                $record->name,
                $record->memberCount,
                $record->id,
            ),
            $existingRecords
        );
    }

    /**
     * @return FieldObject[]
     */
    public function getFields(
        ListObject $list,
        MailingListIntegrationInterface $integration,
        string $category,
        bool $refresh = false
    ): array {
        $existingRecords = MailingListFieldRecord::find()
            ->where([
                'mailingListId' => $list->getId(),
                'category' => $category,
            ])
            ->indexBy('handle')
            ->all()
        ;

        if ($refresh || empty($existingRecords)) {
            $client = $this->clientProvider->getAuthorizedClient($integration);
            $fields = $integration->fetchFields($list, $category, $client);

            $usedHandles = [];
            $newFields = [];
            foreach ($fields as $field) {
                if (!\array_key_exists($field->getHandle(), $existingRecords)) {
                    $newFields[] = $field;
                }

                $usedHandles[] = $field->getHandle();
            }

            foreach ($newFields as $field) {
                $record = new MailingListFieldRecord();
                $record->mailingListId = $list->getId();
                $record->handle = $field->getHandle();
                $record->label = $field->getLabel();
                $record->type = $field->getType();
                $record->required = $field->isRequired();
                $record->category = $category;
                $record->save();

                $existingRecords[$field->getHandle()] = $record;
            }

            foreach ($existingRecords as $handle => $record) {
                if (!\in_array($handle, $usedHandles, true)) {
                    $record->delete();
                    unset($existingRecords[$handle]);
                }
            }
        }

        return array_map(
            fn (MailingListFieldRecord $record) => new FieldObject(
                $record->handle,
                $record->label,
                $record->type,
                $record->category,
                $record->required,
            ),
            $existingRecords
        );
    }

    protected function getIntegrationType(): string
    {
        return IntegrationInterface::TYPE_MAILING_LISTS;
    }

    protected function getIntegrationInterface(): string
    {
        return MailingListIntegrationInterface::class;
    }
}
