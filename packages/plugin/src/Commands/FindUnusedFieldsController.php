<?php

namespace Solspace\Freeform\Commands;

use Craft;
use craft\db\Query;
use Solspace\Freeform\Freeform;
use yii\console\Controller;
use yii\helpers\Console;

class FindUnusedFieldsController extends Controller
{
    public function actionIndex(): int
    {
        $db = Craft::$app->getDb();

        $fieldIds = $db->createCommand('SELECT id FROM {{%freeform_fields}}')->queryColumn();

        $submissionTables = array_filter($db->schema->getTableNames(), function ($tableName) {
            return str_starts_with($tableName, Craft::$app->getDb()->tablePrefix . 'freeform_submissions_');
        });

        $usedFieldIds = [];

        foreach ($submissionTables as $tableName) {
            $columns = $db->getSchema()->getTableSchema($tableName)->columnNames;

            foreach ($columns as $columnName) {
                if (preg_match('/_(\d+)$/', $columnName, $matches)) {
                    $usedFieldIds[] = (int) $matches[1];
                }
            }
        }

        $usedFieldIds = array_unique($usedFieldIds);

        $unusedFieldIds = array_diff($fieldIds, $usedFieldIds);

        if (empty($unusedFieldIds)) {
            $this->stdout("No unused fields found.\n", Console::FG_GREEN);
            return Controller::EXIT_CODE_NORMAL;
        }

        $this->stdout("Unused Fields in Freeform:\n", Console::FG_BLUE);

        $unusedFields = (new Query())
            ->select(['id', 'handle', 'label'])
            ->from('{{%freeform_fields}}')
            ->where(['id' => $unusedFieldIds])
            ->all()
        ;

        foreach ($unusedFields as $field) {
            $this->stdout("- #{$field['id']}: {$field['label']} ({$field['handle']})\n", Console::FG_YELLOW);
        }

        return Controller::EXIT_CODE_NORMAL;
    }
}
