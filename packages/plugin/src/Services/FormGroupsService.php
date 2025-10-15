<?php

namespace Solspace\Freeform\Services;

use craft\db\Query;
use Solspace\Freeform\Records\FormGroupsEntriesRecord;
use Solspace\Freeform\Records\FormGroupsRecord;

class FormGroupsService extends BaseService
{
    public function getAllFormGroupsBySiteId(int $siteId): array
    {
        $query = $this->getGroupQuery();
        $query
            ->where(['groups.siteId' => $siteId])
            ->orderBy(['groups.order' => \SORT_ASC])
            ->indexBy('id')
        ;

        $groupRecords = $query->all();

        $groupedFormIds = (new Query())
            ->select(['groupId', 'formId'])
            ->from(FormGroupsEntriesRecord::TABLE)
            ->where(['groupId' => array_column($groupRecords, 'id')])
            ->all()
        ;

        foreach ($groupedFormIds as $row) {
            $groupId = (int) $row['groupId'];
            $formId = (int) $row['formId'];

            $groupRecords[$groupId]['formIds'][] = $formId;
        }

        return array_values($groupRecords);
    }

    public function getUnusedFormIds(): array
    {
        $siteId = \Craft::$app->sites->currentSite->id;
        $groups = $this->getAllFormGroupsBySiteId($siteId);

        $allFormIds = $this->getFormsService()->getAllFormIds();
        $usedFormIds = [];
        foreach ($groups as $group) {
            $usedFormIds = array_merge($usedFormIds, $group['formIds']);
        }

        return array_diff($allFormIds, $usedFormIds);
    }

    public function deleteById(int $formId): bool
    {
        $siteId = \Craft::$app->sites->currentSite->id;

        $transaction = \Craft::$app->db->beginTransaction();

        try {
            FormGroupsEntriesRecord::deleteAll([
                'formId' => $formId,
                'groupId' => FormGroupsRecord::find()
                    ->select('id')
                    ->where(['siteId' => $siteId]),
            ]);

            $transaction->commit();

            return true;
        } catch (\Exception $e) {
            if (null !== $transaction) {
                $transaction->rollBack();
            }

            throw $e;
        }
    }

    private function getGroupQuery(): Query
    {
        return (new Query())
            ->select([
                'groups.id',
                'groups.siteId',
                'groups.label',
                'groups.uid',
                'groups.order',
                'groups.dateCreated',
                'groups.dateUpdated',
            ])
            ->from(FormGroupsRecord::TABLE.' groups')
            ->orderBy(['groups.order' => \SORT_ASC])
        ;
    }
}
