<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use yii\db\Query;

/**
 * m240315_100655_UserIntegrationMultiGroupChoice migration.
 */
class m240315_100655_UserIntegrationMultiGroupChoice extends Migration
{
    public function safeUp(): bool
    {
        $results = (new Query())
            ->select('fi.[[metadata]]')
            ->from('{{%freeform_forms_integrations}} fi')
            ->innerJoin('{{%freeform_integrations}} i', '[[fi.integrationId]] = [[i.id]]')
            ->where(['i.[[class]]' => 'Solspace\Freeform\Integrations\Elements\User\User'])
            ->indexBy('fi.id')
            ->column()
        ;

        foreach ($results as $id => $row) {
            $data = json_decode($row, true);

            $groupId = $data['userGroupId'] ?? null;
            $data['userGroupIds'] = $groupId ? [(string) $groupId] : [];

            unset($data['userGroupId']);

            $this->update(
                '{{%freeform_forms_integrations}}',
                ['metadata' => json_encode($data)],
                ['id' => $id]
            );
        }

        return true;
    }

    public function safeDown(): bool
    {
        $results = (new Query())
            ->select('fi.[[metadata]]')
            ->from('{{%freeform_forms_integrations}} fi')
            ->innerJoin('{{%freeform_integrations}} i', '[[fi.integrationId]] = [[i.id]]')
            ->where(['i.[[class]]' => 'Solspace\Freeform\Integrations\Elements\User\User'])
            ->indexBy('fi.id')
            ->column()
        ;

        foreach ($results as $id => $row) {
            $data = json_decode($row, true);

            $groupId = $data['userGroupIds'][0] ?? '';
            $data['userGroupId'] = $groupId;

            unset($data['userGroupIds']);

            $this->update(
                '{{%freeform_forms_integrations}}',
                ['metadata' => json_encode($data)],
                ['id' => $id]
            );
        }

        return true;
    }
}
