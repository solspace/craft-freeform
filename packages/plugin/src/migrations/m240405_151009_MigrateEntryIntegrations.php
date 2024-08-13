<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use craft\db\Query;

/**
 * m240405_151009_MigrateEntryIntegrations migration.
 */
class m240405_151009_MigrateEntryIntegrations extends Migration
{
    public function safeUp(): bool
    {
        $isCraft5 = version_compare(\Craft::$app->getVersion(), '5', '>=');
        if ($isCraft5) {
            return true;
        }

        $integrations = (new Query())
            ->select(['metadata'])
            ->from('{{%freeform_integrations}}')
            ->where(['class' => 'Solspace\Freeform\Integrations\Elements\Entry\Entry'])
            ->indexBy('id')
            ->column()
        ;

        foreach ($integrations as $id => $result) {
            $metadata = json_decode($result, true);

            if (isset($metadata['entryTypeId'])) {
                $entryTypeId = $metadata['entryTypeId'];
                $entryType = \Craft::$app->sections->getEntryTypeById($entryTypeId);
                if (!$entryType) {
                    unset($metadata['entryTypeId']);
                    $metadata['sectionEntry'] = '';
                } else {
                    $sectionId = $entryType->sectionId;

                    $metadata['sectionEntry'] = \sprintf('%s:%s', $sectionId, $entryTypeId);
                    unset($metadata['entryTypeId']);
                }

                $metadata = json_encode($metadata);

                $this->update(
                    '{{%freeform_integrations}}',
                    ['metadata' => $metadata],
                    ['id' => $id]
                );
            }
        }

        $formIntegrations = (new Query())
            ->select(['fi.[[metadata]]'])
            ->from('{{%freeform_forms_integrations}} fi')
            ->where(['fi.[[integrationId]]' => array_keys($integrations)])
            ->indexBy('id')
            ->column()
        ;

        foreach ($formIntegrations as $id => $result) {
            $metadata = json_decode($result, true);

            if (isset($metadata['entryTypeId'])) {
                $entryTypeId = $metadata['entryTypeId'];
                $entryType = \Craft::$app->sections->getEntryTypeById($entryTypeId);
                if (!$entryType) {
                    unset($metadata['entryTypeId']);
                    $metadata['sectionEntry'] = '';
                } else {
                    $sectionId = $entryType->sectionId;

                    $metadata['sectionEntry'] = \sprintf('%s:%s', $sectionId, $entryTypeId);
                    unset($metadata['entryTypeId']);
                }

                $metadata = json_encode($metadata);

                $this->update(
                    '{{%freeform_forms_integrations}}',
                    ['metadata' => $metadata],
                    ['id' => $id]
                );
            }
        }

        return true;
    }

    public function safeDown(): bool
    {
        echo "m240405_151009_MigrateEntryIntegrations cannot be reverted.\n";

        return false;
    }
}
