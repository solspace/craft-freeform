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

        $db->createCommand()
            ->addPrimaryKey('PK', $tableName, ['id'])
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

        $this->table = new TableInfo($tableName, ['id']);
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

        $this->table->updateTableName($newTableName);
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

            $this->table->renameFieldColumn($id, $newColumn);
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

            $this->table->removeColumn($id);
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

            $columnName = Submission::generateFieldColumnName($id, $newField['handle'] ?? null);

            \Craft::$app->db->createCommand()
                ->addColumn($table->getTableName(), $columnName, 'text')
                ->execute()
            ;

            $this->table->addColumn($columnName);
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
