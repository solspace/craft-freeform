<?php

namespace Solspace\Freeform\Services;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Library\Composer\Components\Form;

class FormContentService extends BaseService
{
    public function performDatabaseColumnAlterations(Form $form, string $oldLayout, string $newLayout): void
    {
        $old = json_decode($oldLayout, true);
        $new = json_decode($newLayout, true);

        $oldProps = $old['composer']['properties'] ?? null;
        $newProps = $new['composer']['properties'] ?? null;

        $oldFields = $this->extractFieldFromProperties($oldProps);
        $newFields = $this->extractFieldFromProperties($newProps);

        $this->renameContentTable($oldProps['form']['handle'], $newProps['form']['handle']);

        $this->renameFieldColumns($form, $oldFields, $newFields);
        $this->deleteUnusedFieldColumns($form, $oldFields, $newFields);
        $this->createNewFieldColumns($form, $oldFields, $newFields);
    }

    private function renameContentTable(string $oldHandle, string $newHandle): void
    {
        if ($oldHandle === $newHandle) {
            return;
        }

        \Craft::$app->db->createCommand()
            ->renameTable(
                Submission::getContentTableName($oldHandle),
                Submission::getContentTableName($newHandle)
            )
            ->execute()
        ;
    }

    private function renameFieldColumns(Form $form, ?array $old, ?array $new): void
    {
        foreach ($old as $id => $oldField) {
            $newField = $new[$id] ?? null;

            if (null === $newField) {
                continue;
            }

            $oldHandle = Submission::generateFieldColumnName($id, $oldField['handle']);
            $newHandle = Submission::generateFieldColumnName($id, $newField['handle']);

            if ($oldHandle === $newHandle || !$newHandle) {
                continue;
            }

            \Craft::$app->db->createCommand()
                ->renameColumn(
                    Submission::getContentTableName($form->getHandle()),
                    $oldHandle,
                    $newHandle
                )
                ->execute()
            ;
        }
    }

    private function deleteUnusedFieldColumns(Form $form, ?array $old, ?array $new): void
    {
        foreach ($old as $id => $olfField) {
            $newField = $new[$id] ?? null;

            if (null !== $newField) {
                continue;
            }

            \Craft::$app->db->createCommand()
                ->dropColumn(
                    Submission::getContentTableName($form->getHandle()),
                    Submission::generateFieldColumnName($id, $olfField['handle'])
                )
                ->execute()
            ;
        }
    }

    private function createNewFieldColumns(Form $form, ?array $old, ?array $new): void
    {
        foreach ($new as $id => $newField) {
            $oldField = $old[$id] ?? null;

            if (null !== $oldField) {
                continue;
            }

            \Craft::$app->db->createCommand()
                ->addColumn(
                    Submission::getContentTableName($form->getHandle()),
                    Submission::generateFieldColumnName($id, $newField['handle']),
                    'text'
                )
                ->execute()
            ;
        }
    }

    private function extractFieldFromProperties(array $properties): array
    {
        $fields = [];
        foreach ($properties as $item) {
            $id = $item['id'] ?? null;
            $handle = $item['handle'] ?? null;
            $type = $item['type'] ?? null;

            if (!$id || !$handle || !$type) {
                continue;
            }

            $fields[$id] = $item;
        }

        return $fields;
    }
}
