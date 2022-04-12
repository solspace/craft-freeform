<?php

namespace Solspace\Freeform\Form\Managers;

use craft\db\Connection;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Form\Managers\ContentManager\TableInfo;
use Solspace\Freeform\Library\Composer\Components\Form;
use yii\db\Schema;

class ContentManager
{
    private ?array $oldProperties;
    private ?array $newProperties;

    private ?array $oldFields;
    private ?array $newFields;

    private ?TableInfo $table = null;

    public function __construct(private Form $form, ?string $oldLayout, ?string $newLayout)
    {
        $old = json_decode($oldLayout, true);
        $new = json_decode($newLayout, true);

        $this->oldProperties = $old['composer']['properties'] ?? null;
        $this->newProperties = $new['composer']['properties'] ?? null;

        $this->oldFields = $this->extractFieldsFromProperties($this->oldProperties);
        $this->newFields = $this->extractFieldsFromProperties($this->newProperties);

        $this->refreshTableSchema();
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

        $db->createCommand()
            ->addPrimaryKey('PK', $tableName, ['id'])
            ->execute()
        ;

        $this->refreshTableSchema();
    }

    private function renameContentTable(): void
    {
        $id = $this->form->getId();

        $oldTableName = $this->table->getTableName();

        $newHandle = $this->newProperties['form']['handle'] ?? null;
        $newTableName = Submission::generateContentTableName($id, $newHandle);

        if ($oldTableName === $newTableName) {
            return;
        }

        $this->getDb()->createCommand()
            ->renameTable($oldTableName, $newTableName)
            ->execute()
        ;

        $this->refreshTableSchema();
    }

    private function renameFieldColumns(): void
    {
        $old = $this->oldFields;
        $new = $this->newFields;

        $table = $this->table;

        foreach ($old as $id => $oldField) {
            $newField = $new[$id] ?? null;

            if (null === $newField) {
                continue;
            }

            $oldColumn = $table->getFieldColumnName($id);
            $newColumn = Submission::generateFieldColumnName($id, $newField['handle']);

            if ($oldColumn === $newColumn || !$oldColumn || !$newColumn) {
                continue;
            }

            \Craft::$app->db->createCommand()
                ->renameColumn(
                    $table->getTableName(),
                    $oldColumn,
                    $newColumn
                )
                ->execute()
            ;
        }
    }

    private function deleteUnusedFieldColumns(): void
    {
        $old = $this->oldFields;
        $new = $this->newFields;

        $table = $this->table;

        foreach ($old as $id => $oldField) {
            $newField = $new[$id] ?? null;

            if (null !== $newField) {
                continue;
            }

            $fieldColumn = $table->getFieldColumnName($id);
            if (!$fieldColumn) {
                continue;
            }

            \Craft::$app->db->createCommand()
                ->dropColumn($table->getTableName(), $fieldColumn)
                ->execute()
            ;
        }
    }

    private function createNewFieldColumns(): void
    {
        $old = $this->oldFields;
        $new = $this->newFields;

        $table = $this->table;

        foreach ($new as $id => $newField) {
            $oldField = $old[$id] ?? null;

            if (null !== $oldField) {
                continue;
            }

            \Craft::$app->db->createCommand()
                ->addColumn(
                    $table->getTableName(),
                    Submission::generateFieldColumnName($id, $newField['handle'] ?? null),
                    'text'
                )
                ->execute()
            ;
        }
    }

    private function extractFieldsFromProperties(?array $properties): array
    {
        $fields = [];
        if (null === $properties) {
            return $fields;
        }

        foreach ($properties as $item) {
            $id = $item['id'] ?? null;
            $type = $item['type'] ?? null;

            if (!$id || !$type) {
                continue;
            }

            $fields[$id] = $item;
        }

        return $fields;
    }

    private function refreshTableSchema(): void
    {
        $this->table = null;

        $formId = $this->form->getId();

        $schema = \Craft::$app->db->getSchema();
        foreach ($schema->getTableSchemas('', true) as $table) {
            if (preg_match("/^freeform_submissions_.*_{$formId}$/", $table->name)) {
                $this->table = new TableInfo(
                    '{{%'.$table->name.'}}',
                    $table->columnNames
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
