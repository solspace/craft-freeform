<?php

namespace Solspace\Freeform\Bundles\Backup\Export\FormieV3\Layout;

use craft\helpers\StringHelper;
use Solspace\Freeform\Bundles\Backup\Collections\FieldCollection;
use Solspace\Freeform\Bundles\Backup\Collections\RowCollection;
use Solspace\Freeform\Bundles\Backup\DTO\Field;
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
        // Get Formie form fields
        try {
            $formFields = $form->getFields();
        } catch (\Throwable $e) {
            $formFields = [];
        }

        if (empty($formFields)) {
            // Create a default page if no fields
            $this->createDefaultPage($form, $exported);

            return;
        }

        // Check if Formie has pages structure (multi-page forms)
        $pages = $this->getFormiePages($form);

        if (empty($pages)) {
            // Single page form - create one page with all fields
            $this->createSinglePageLayout($form, $exported, $formFields);
        } else {
            // Multi-page form - create pages based on Formie structure
            $this->createMultiPageLayout($form, $exported, $pages);
        }
    }

    private function createDefaultPage($form, $exported): void
    {
        $formUid = \is_array($form) ? ($form['uid'] ?? 'form-'.$form['id']) : $form->uid;

        $page = new Page();
        $page->uid = StringHelper::UUID();
        $page->label = 'Page 1';

        $layout = new Layout();
        $layout->uid = StringHelper::UUID();
        $layout->rows = new RowCollection();

        $page->layout = $layout;
        $exported->pages->add($page);
    }

    private function createSinglePageLayout(FormieForm $form, $exported, array $formFields): void
    {
        $page = new Page();
        $page->uid = StringHelper::UUID();
        $page->label = 'Page 1';

        $layout = new Layout();
        $layout->uid = StringHelper::UUID();
        $layout->rows = new RowCollection();

        // Group fields into rows
        $this->addFieldsToLayout($formFields, $layout, $form->uid);

        $page->layout = $layout;
        $exported->pages->add($page);
    }

    private function createMultiPageLayout(FormieForm $form, $exported, array $pages): void
    {
        foreach ($pages as $pageIndex => $pageData) {
            $page = new Page();
            $page->uid = StringHelper::UUID();
            $page->label = $pageData['label'] ?? 'Page '.($pageIndex + 1);

            $layout = new Layout();
            $layout->uid = StringHelper::UUID();
            $layout->rows = new RowCollection();

            // Add fields for this page
            if (isset($pageData['fields']) && !empty($pageData['fields'])) {
                $this->addFieldsToLayout($pageData['fields'], $layout, $form->uid);
            }

            $page->layout = $layout;
            $exported->pages->add($page);
        }
    }

    private function addFieldsToLayout(array $formFields, Layout $layout, string $formUid): void
    {
        foreach ($formFields as $index => $formField) {
            // Special handling for Name fields that need to be split into multiple fields
            if ('verbb\formie\fields\Name' === $formField::class) {
                $this->addNameFieldsToLayout($formField, $layout, $formUid, $index);

                continue;
            }

            $field = $this->fieldMapper->mapField($formField, $formUid, $index);

            if (!$field) {
                continue; // Skip unsupported field types
            }

            $row = new Row();
            $row->uid = StringHelper::UUID();
            $row->fields = new FieldCollection();
            $row->fields->add($field);

            $layout->rows->add($row);
        }
    }

    private function addNameFieldsToLayout($formField, Layout $layout, string $formUid, int $index): void
    {
        // Get the NameProcessor to create sub-fields
        $nameProcessor = new NameProcessor();
        $subFields = $nameProcessor->getSubFields($formField, $formUid, $index);

        // Create a single row with all the name sub-fields
        $row = new Row();
        $row->uid = StringHelper::UUID();
        $row->fields = new FieldCollection();

        foreach ($subFields as $subField) {
            $row->fields->add($subField);
        }

        $layout->rows->add($row);
    }

    private function getFormiePages(FormieForm $form): array
    {
        // This is a placeholder for Formie-specific page structure

        // Check if form has pages property
        if (property_exists($form, 'pages') && !empty($form->pages)) {
            return $form->pages;
        }

        // Check if form has layout property with pages
        if (property_exists($form, 'layout') && isset($form->layout['pages'])) {
            return $form->layout['pages'];
        }

        // Check if form has settings with pages
        if (property_exists($form, 'settings') && isset($form->settings->pages)) {
            return $form->settings->pages;
        }

        return [];
    }
}
