<?php

namespace Solspace\Freeform\migrations;

use Craft;
use craft\db\Migration;
use craft\db\Query;
use Solspace\Freeform\FieldTypes\FormFieldType;

/**
 * m180120_140521_CraftUpgrade migration.
 */
class m180120_140521_CraftUpgrade extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp(): bool
    {
        $freeform = (new Query())
            ->select(['id', 'version'])
            ->from('{{%plugins}}')
            ->where([
                'handle' => 'freeform',
            ])
            ->one()
        ;

        if (!$freeform) {
            return true;
        }

        $id = $freeform['id'];
        $version = $freeform['version'];

        // Only touch version below the 2.0
        if (version_compare($version, '2.0.0-dev', '>=')) {
            return true;
        }

        $this->update(
            '{{%fields}}',
            ['type' => FormFieldType::class],
            ['type' => 'Freeform_Forms'],
            [],
            false
        );

        if (!Craft::$app->db->columnExists('{{%freeform_forms}}', 'formTemplateId', true)) {
            $this->addColumn('{{%freeform_forms}}', 'formTemplateId', 'int unsigned');
        }

        $prefix = Craft::$app->db->tablePrefix;
        if ($prefix) {
            $oldForeignKeys = [
                $prefix.'freeform_crm_fields_integrationId_fk' => '{{%freeform_crm_fields}}',
                $prefix.'freeform_export_profiles_formId_fk' => '{{%freeform_export_profiles}}',
                $prefix.'freeform_export_settings_userId_fk' => '{{%freeform_export_settings}}',
                $prefix.'freeform_fields_notificationId_fk' => '{{%freeform_fields}}',
                $prefix.'freeform_mailing_list_fields_mailingListId_fk' => '{{%freeform_mailing_list_fields}}',
                $prefix.'freeform_mailing_lists_integrationId_fk' => '{{%freeform_mailing_lists}}',
                $prefix.'freeform_submissions_id_fk' => '{{%freeform_submissions}}',
                $prefix.'freeform_submissions_statusId_fk' => '{{%freeform_submissions}}',
                $prefix.'freeform_submissions_formId_fk' => '{{%freeform_submissions}}',
            ];

            foreach ($oldForeignKeys as $key => $table) {
                try {
                    $this->dropForeignKey($key, $table);
                } catch (\Exception $e) {
                }
            }

            try {
                $this->addForeignKey(
                    'crm_fields_integrationId',
                    '{{%freeform_crm_fields}}',
                    'integrationId',
                    '{{%freeform_integrations}}',
                    'id',
                    'CASCADE'
                );
            } catch (\Exception $e) {
            }

            try {
                $this->addForeignKey(
                    'mailing_list_fields_mailingListId',
                    '{{%freeform_mailing_list_fields}}',
                    'mailingListId',
                    '{{%freeform_mailing_lists}}',
                    'id',
                    'CASCADE'
                );
            } catch (\Exception $e) {
            }

            try {
                $this->addForeignKey(
                    'mailing_lists_integrationId',
                    '{{%freeform_mailing_lists}}',
                    'integrationId',
                    '{{%freeform_integrations}}',
                    'id',
                    'CASCADE'
                );
            } catch (\Exception $e) {
            }

            try {
                $this->addForeignKey(
                    'submissions_id_fk',
                    '{{%freeform_submissions}}',
                    'id',
                    '{{%elements}}',
                    'id',
                    'CASCADE'
                );
            } catch (\Exception $e) {
            }

            try {
                $this->addForeignKey(
                    'submissions_formId_fk',
                    '{{%freeform_submissions}}',
                    'formId',
                    '{{%freeform_forms}}',
                    'id',
                    'CASCADE'
                );
            } catch (\Exception $e) {
            }

            try {
                $this->addForeignKey(
                    'submissions_statusId_fk',
                    '{{%freeform_submissions}}',
                    'statusId',
                    '{{%freeform_statuses}}',
                    'id',
                    'CASCADE'
                );
            } catch (\Exception $e) {
            }
        }

        try {
            // Rename the saved export profiles
            $this->renameTable('{{%freeform_export_profiles}}', '{{%freeform_export_profiles_backup}}');
            $this->renameTable('{{%freeform_export_settings}}', '{{%freeform_export_settings_backup}}');
        } catch (\Exception $e) {
        }

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
            'additionalProperties',
            'assetSourceId',
        ];

        $rows = (new Query())
            ->select(array_merge(['id', 'type'], $mergeableFields))
            ->from($table)
            ->all()
        ;

        foreach ($rows as $row) {
            $id = $row['id'];
            $type = $row['type'];

            unset($row['id'], $row['type']);

            $mergedData = [];
            foreach ($row as $key => $value) {
                if (null === $value) {
                    continue;
                }

                if ('checked' === $key) {
                    if ('checkbox' !== $type) {
                        continue;
                    }

                    $value = (bool) $value;
                }

                if ('additionalProperties' === $key) {
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
            $this->dropForeignKey($prefix.'freeform_fields_notificationId_fk', $table);
            $this->dropForeignKey($prefix.'freeform_fields_assetSourceId_fk', $table);
        } catch (\Exception $e) {
        }

        foreach ($mergeableFields as $column) {
            $this->dropColumn($table, $column);
        }

        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown(): bool
    {
        return false;
    }
}
