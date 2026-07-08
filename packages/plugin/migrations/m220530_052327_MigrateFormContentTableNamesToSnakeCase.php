<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use craft\db\Query;
use craft\helpers\StringHelper;

class m220530_052327_MigrateFormContentTableNamesToSnakeCase extends Migration
{
    public function safeUp(): bool
    {
        $forms = (new Query())
            ->select(['id', 'handle'])
            ->from('{{%freeform_forms}}')
            ->pairs()
        ;

        $prefix = \Craft::$app->db->tablePrefix;
        $prefixLength = \strlen($prefix);
        $maxHandleSize = 36 - $prefixLength;

        $tables = $this->db->schema->getTableSchemas();
        foreach ($tables as $table) {
            if (!preg_match("/{$prefix}(freeform_submissions_.*_(\\d+))$/", $table->name, $matches)) {
                continue;
            }

            $tableName = $matches[1];
            $formId = $matches[2];

            $formHandle = $forms[$formId] ?? null;
            if (!$formHandle) {
                continue;
            }

            $handle = StringHelper::toSnakeCase($formHandle);
            $handle = StringHelper::truncate($handle, $maxHandleSize, '');
            $handle = trim($handle, '-_');

            $tempTableName = 'tmp_'.substr(sha1($tableName), 0, 5);
            $this->renameTable('{{%'.$tableName.'}}', '{{%'.$tempTableName.'}}');

            $newName = "{{%freeform_submissions_{$handle}_{$formId}}}";

            $this->renameTable('{{%'.$tempTableName.'}}', $newName);
        }

        return true;
    }

    public function safeDown(): bool
    {
        echo "m220530_052327_MigrateFormContentTableNamesToSnakeCase cannot be reverted.\n";

        return false;
    }
}
