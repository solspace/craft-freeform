<?php

namespace Solspace\Freeform\Form\Managers;

use craft\db\Query;
use Solspace\Freeform\Elements\Submission;

class ContentFixManager
{
    public mixed $onRename = null;
    public mixed $onNotFound = null;

    public function fixTableNames(): int
    {
        $database = \Craft::$app->db;
        $forms = (new Query())
            ->select(['id', 'handle'])
            ->from('{{%freeform_forms}}')
            ->pairs()
        ;

        $count = 0;

        $tables = $database->schema->getTableNames();
        foreach ($tables as $table) {
            if (!preg_match('/(freeform_submissions_)(.*)_(\d+)$/', $table, $matches)) {
                continue;
            }

            $oldTableName = '{{%'.$matches[1].$matches[2].'_'.$matches[3].'}}';
            $formId = (int) $matches[3];

            $originalHandle = $forms[$formId] ?? null;
            if (!$originalHandle) {
                if (\is_callable($this->onNotFound)) {
                    \call_user_func($this->onNotFound, $table);
                }

                continue;
            }

            $newTableName = Submission::generateContentTableName($formId, $originalHandle);

            if ($newTableName === $oldTableName) {
                continue;
            }

            if (\is_callable($this->onRename)) {
                \call_user_func($this->onRename, $table, $oldTableName, $newTableName);
            }

            $database
                ->createCommand()
                ->renameTable($oldTableName, $newTableName)
                ->execute()
            ;

            ++$count;
        }

        return $count;
    }
}
