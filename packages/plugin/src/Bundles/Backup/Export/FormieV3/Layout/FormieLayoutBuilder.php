<?php

namespace Solspace\Freeform\Bundles\Backup\Export\FormieV3\Layout;

use craft\helpers\StringHelper;
use Solspace\Freeform\Bundles\Backup\Collections\FieldCollection;
use Solspace\Freeform\Bundles\Backup\Collections\RowCollection;
use Solspace\Freeform\Bundles\Backup\DTO\Layout;
use Solspace\Freeform\Bundles\Backup\DTO\Page;
use Solspace\Freeform\Bundles\Backup\DTO\Row;
use Solspace\Freeform\Bundles\Backup\Export\FormieV3\Fields\FormieFieldMapper;
use Solspace\Freeform\Bundles\Backup\Export\FormieV3\Fields\Processors\NameProcessor;
use verbb\formie\elements\Form as FormieForm;

class FormieLayoutBuilder
{
    public function __construct(private FormieFieldMapper $fieldMapper) {}

    public function buildFormLayout(FormieForm $form, $exported): void
    {
        $formFields = $form->getFields();

        if (empty($formFields)) {
            $this->createDefaultPage($exported);

            return;
        }

        // Check if this is a multipage form
        $pages = $form->getPages();

        if (empty($pages)) {
            $this->createSinglePageLayout($exported, $formFields, $form->uid);
        } else {
            $this->createMultiPageLayout($exported, $form, $form->uid);
        }
    }

    private function createDefaultPage($exported): void
    {
        $page = new Page();
        $page->uid = StringHelper::UUID();
        $page->label = 'Page 1';
        $page->layout = $this->createEmptyLayout();
        $exported->pages->add($page);
    }

    private function createSinglePageLayout($exported, array $formFields, string $formUid): void
    {
        $page = new Page();
        $page->uid = StringHelper::UUID();
        $page->label = 'Page 1';
        $page->layout = $this->createLayoutWithFields($formFields, $formUid);
        $exported->pages->add($page);
    }

    private function createMultiPageLayout($exported, FormieForm $form, string $formUid): void
    {
        $pages = $form->getPages();
        $rows = $form->getRows();

        foreach ($pages as $pageIndex => $pageData) {
            $page = new Page();
            $page->uid = StringHelper::UUID();
            $page->label = $pageData->label ?? 'Page '.($pageIndex + 1);

            // Get rows that belong to this page
            $pageRows = array_filter($rows, function ($row) use ($pageData) {
                return $row->pageId === $pageData->id;
            });

            // Create layout with the correct rows and fields
            $page->layout = $this->createLayoutFromRows($pageRows, $formUid);
            $exported->pages->add($page);
        }
    }

    private function createEmptyLayout(): Layout
    {
        $layout = new Layout();
        $layout->uid = StringHelper::UUID();
        $layout->rows = new RowCollection();

        return $layout;
    }

    private function createLayoutWithFields(array $formFields, string $formUid): Layout
    {
        $layout = new Layout();
        $layout->uid = StringHelper::UUID();
        $layout->rows = new RowCollection();

        foreach ($formFields as $index => $formField) {
            if ('verbb\formie\fields\Name' === $formField::class) {
                $this->addNameFieldsToLayout($formField, $layout, $formUid, $index);

                continue;
            }

            $field = $this->fieldMapper->mapField($formField, $formUid, $index);
            if (!$field) {
                continue;
            }

            $row = new Row();
            $row->uid = StringHelper::UUID();
            $row->fields = new FieldCollection();
            $row->fields->add($field);
            $layout->rows->add($row);
        }

        return $layout;
    }

    private function createLayoutFromRows(array $pageRows, string $formUid): Layout
    {
        $layout = new Layout();
        $layout->uid = StringHelper::UUID();
        $layout->rows = new RowCollection();

        foreach ($pageRows as $rowData) {
            $row = new Row();
            $row->uid = StringHelper::UUID();
            $row->fields = new FieldCollection();

            $fields = $rowData->getFields();
            foreach ($fields as $index => $formField) {
                if ('verbb\formie\fields\Name' === $formField::class) {
                    $this->addNameFieldsToRow($formField, $row, $formUid, $index);

                    continue;
                }

                $field = $this->fieldMapper->mapField($formField, $formUid, $index);
                if (!$field) {
                    continue;
                }

                $row->fields->add($field);
            }

            if ($row->fields->count() > 0) {
                $layout->rows->add($row);
            }
        }

        return $layout;
    }

    private function addNameFieldsToLayout($formField, Layout $layout, string $formUid, int $index): void
    {
        $nameProcessor = new NameProcessor();
        $subFields = $nameProcessor->getSubFields($formField, $formUid, $index);

        $row = new Row();
        $row->uid = StringHelper::UUID();
        $row->fields = new FieldCollection();

        foreach ($subFields as $subField) {
            $row->fields->add($subField);
        }

        $layout->rows->add($row);
    }

    private function addNameFieldsToRow($formField, Row $row, string $formUid, int $index): void
    {
        $nameProcessor = new NameProcessor();
        $subFields = $nameProcessor->getSubFields($formField, $formUid, $index);

        foreach ($subFields as $subField) {
            $row->fields->add($subField);
        }
    }
}
