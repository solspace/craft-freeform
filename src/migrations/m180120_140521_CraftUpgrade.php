<?php

namespace Solspace\Freeform\migrations;

use Craft;
use craft\db\Migration;
use craft\db\Query;

/**
 * m180120_140521_CraftUpgrade migration.
 */
class m180120_140521_CraftUpgrade extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp(): bool
    {
        $freeform = (new Query())
            ->select(['id', 'version'])
            ->from('{{%plugins}}')
            ->where([
                'handle' => 'freeform',
            ])
            ->one();

        if (!$freeform) {
            return true;
        }

        $id      = $freeform['id'];
        $version = $freeform['version'];

        // Only touch version below the 2.0
        if (version_compare($version, '2.0.0-dev', '>=')) {
            return true;
        }

        if (!Craft::$app->db->columnExists('{{%freeform_forms}}', 'formTemplateId', true)) {
            $this->addColumn('{{%freeform_forms}}', 'formTemplateId', 'int unsigned');
        }

        $prefix = Craft::$app->db->tablePrefix;
        if ($prefix) {
            $this->dropForeignKey($prefix . 'freeform_crm_fields_integrationId_fk', '{{%freeform_crm_fields}}');
            $this->dropForeignKey($prefix . 'freeform_export_profiles_formId_fk', '{{%freeform_export_profiles}}');
            $this->dropForeignKey($prefix . 'freeform_export_settings_userId_fk', '{{%freeform_export_settings}}');
            $this->dropForeignKey($prefix . 'freeform_fields_notificationId_fk', '{{%freeform_fields}}');
            $this->dropForeignKey($prefix . 'freeform_mailing_list_fields_mailingListId_fk', '{{%freeform_mailing_list_fields}}');
            $this->dropForeignKey($prefix . 'freeform_mailing_lists_integrationId_fk', '{{%freeform_mailing_lists}}');
            $this->dropForeignKey($prefix . 'freeform_submissions_id_fk', '{{%freeform_submissions}}');
            $this->dropForeignKey($prefix . 'freeform_submissions_statusId_fk', '{{%freeform_submissions}}');
            $this->dropForeignKey($prefix . 'freeform_submissions_formId_fk', '{{%freeform_submissions}}');

            $this->addForeignKey(
                'crm_fields_integrationId',
                '{{%freeform_crm_fields}}',
                'integrationId',
                '{{%freeform_integrations}}',
                'id',
                'CASCADE'
            );
            $this->addForeignKey(
                'mailing_list_fields_mailingListId',
                '{{%freeform_mailing_list_fields}}',
                'mailingListId',
                '{{%freeform_mailing_lists}}',
                'id',
                'CASCADE'
            );
            $this->addForeignKey(
                'mailing_lists_integrationId',
                '{{%freeform_mailing_lists}}',
                'integrationId',
                '{{%freeform_integrations}}',
                'id',
                'CASCADE'
            );
            $this->addForeignKey(
                'submissions_id_fk',
                '{{%freeform_submissions}}',
                'id',
                '{{%elements}}',
                'id',
                'CASCADE'
            );
            $this->addForeignKey(
                'submissions_formId_fk',
                '{{%freeform_submissions}}',
                'formId',
                '{{%freeform_forms}}',
                'id',
                'CASCADE'
            );
            $this->addForeignKey(
                'submissions_statusId_fk',
                '{{%freeform_submissions}}',
                'statusId',
                '{{%freeform_statuses}}',
                'id',
                'CASCADE'
            );
        }

        // Rename the saved export profiles
        $this->renameTable('{{%freeform_export_profiles}}', '{{%freeform_export_profiles_backup}}');
        $this->renameTable('{{%freeform_export_settings}}', '{{%freeform_export_settings_backup}}');

        $table = '{{%freeform_fields}}';
        $this->addColumn(
            $table,
            'metaProperties',
            'text default null after assetSourceId'
        );

        $mergeableFields = [
            'notificationId',
            'value',
            'values',
            'placeholder',
            'options',
            'checked',
            'fileKinds',
            'rows',
            'maxFileSizeKB',
            'fileCount',
            'additionalProperties',
            'assetSourceId',
        ];

        $rows = (new Query())
            ->select(array_merge(['id', 'type'], $mergeableFields))
            ->from($table)
            ->all();

        foreach ($rows as $row) {
            $id   = $row['id'];
            $type = $row['type'];

            unset($row['id'], $row['type']);

            $mergedData = [];
            foreach ($row as $key => $value) {
                if (null === $value) {
                    continue;
                }

                if ($key === 'checked') {
                    if ($type !== 'checkbox') {
                        continue;
                    }

                    $value = (bool) $value;
                }

                if ($key === 'additionalProperties') {
                    $mergedData = array_merge($mergedData, json_decode($value, true));
                    continue;
                }

                if (\in_array($key, ['values', 'options'], true)) {
                    $value = json_decode($value, true);
                }

                $mergedData[$key] = $value;
            }

            $insertValue = null;
            if (!empty($mergedData)) {
                $insertValue = json_encode($mergedData);
            }

            $this->update($table, ['metaProperties' => $insertValue], ['id' => $id]);
        }

        try {
            $prefix = \Craft::$app->db->tablePrefix;
            $this->dropForeignKey($prefix . 'freeform_fields_notificationId_fk', $table);
        } catch (\Exception $e) {}

        foreach ($mergeableFields as $column) {
            $this->dropColumn($table, $column);
        }

        return true;
    }

    /**
     * @inheritdoc
     */
    public function safeDown(): bool
    {
        return false;
    }
}
