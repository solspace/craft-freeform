<?php

namespace Solspace\Freeform\Form\Managers;

use craft\db\Connection;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Managers\ContentManager\TableInfo;
use Solspace\Freeform\Records\Form\FormFieldRecord;
use yii\db\Schema;

class ContentManager
{
    private ?TableInfo $table = null;

    /**
     * @param FormFieldRecord[] $fields
     */
    public function __construct(private Form $form, private array $fields)
    {
        $this->getTableSchema();
    }

    public function performDatabaseColumnAlterations(): void
    {
        $this->ensureContentTableCreated();
        $this->renameContentTable();

        $this->renameFieldColumns();
        $this->deleteUnusedFieldColumns();
        $this->createNewFieldColumns();
    }

    private function ensureContentTableCreated(): void
    {
        if ($this->table) {
            return;
        }

        $db = $this->getDb();
        $schema = $db->getSchema();

        $tableName = Submission::getContentTableName($this->form);

        $db->createCommand()
            ->createTable(
                $tableName,
                ['id' => $schema->createColumnSchemaBuilder(Schema::TYPE_INTEGER)]
            )
            ->execute()
        ;

        if (!$db->getIsPgsql()) {
            $db->createCommand()
                ->addPrimaryKey('PK', $tableName, ['id'])
                ->execute()
            ;
        }

        $db->createCommand()
            ->addForeignKey(
                $db->getForeignKeyName(),
                $tableName,
                'id',
                '{{%freeform_submissions}}',
                'id',
                'CASCADE'
            )
            ->execute()
        ;

        $this->table = new TableInfo($tableName, ['id']);
    }

    private function renameContentTable(): void
    {
        $id = $this->form->getId();

        $oldTableName = $this->table->getTableName();

        $newHandle = $this->form->getSettings()->getGeneral()->handle;
        $newTableName = Submission::generateContentTableName($id, $newHandle);

        if ($oldTableName === $newTableName) {
            return;
        }

        $this->getDb()->createCommand()
            ->renameTable($oldTableName, $newTableName)
            ->execute()
        ;

        $this->table->updateTableName($newTableName);
    }

    private function renameFieldColumns(): void
    {
        $table = $this->table;
        foreach ($this->fields as $field) {
            $metadata = json_decode($field->metadata);
            $handle = $metadata->handle ?? null;
            if (!$handle) {
                continue;
            }

            $oldColumn = $table->getFieldColumnName($field->id);
            $newColumn = Submission::generateFieldColumnName($field->id, $handle);

            if ($oldColumn === $newColumn || !$oldColumn || !$newColumn) {
                continue;
            }

            \Craft::$app->db->createCommand()
                ->renameColumn(
                    $table->getTableName(),
                    $oldColumn,
                    $newColumn
                )
                ->execute();

            $this->table->renameFieldColumn($field->id, $newColumn);
        }
    }

    private function deleteUnusedFieldColumns(): void
    {
        $table = $this->table;

        $usedFieldIds = [];
        foreach ($this->fields as $field) {
            $usedFieldIds[] = (int) $field->id;
        }

        foreach ($table->getFieldColumnFieldIds() as $columnFieldId) {
            if (\in_array($columnFieldId, $usedFieldIds, true)) {
                continue;
            }

            $columnName = $table->getFieldColumnName($columnFieldId);

            \Craft::$app->db->createCommand()
                ->dropColumn($table->getTableName(), $columnName)
                ->execute();

            $this->table->removeColumn($columnFieldId);
        }
    }

    private function createNewFieldColumns(): void
    {
        $table = $this->table;
        $existingFieldIds = $table->getFieldColumnFieldIds();

        foreach ($this->fields as $field) {
            if (\in_array($field->id, $existingFieldIds, true)) {
                continue;
            }

            $metadata = json_decode($field->metadata);
            $handle = $metadata->handle ?? null;
            if (!$handle) {
                continue;
            }

            $columnName = Submission::generateFieldColumnName($field->id, $handle);

            \Craft::$app->db->createCommand()
                ->addColumn($table->getTableName(), $columnName, 'text')
                ->execute();

            $this->table->addColumn($columnName);
        }
    }

    private function getTableSchema(): void
    {
        $this->table = null;

        $formId = $this->form->getId();

        $schema = \Craft::$app->db->getSchema();
        $tableNames = $schema->getTableNames();
        $prefix = \Craft::$app->db->tablePrefix;

        foreach ($tableNames as $name) {
            if (preg_match("/{$prefix}(freeform_submissions_.*_{$formId})$/", $name, $matches)) {
                $this->table = new TableInfo(
                    '{{%'.$matches[1].'}}',
                    $schema->getTableSchema($name)->columnNames
                );

                return;
            }
        }
    }

    private function getDb(): Connection
    {
        return \Craft::$app->db;
    }
}
