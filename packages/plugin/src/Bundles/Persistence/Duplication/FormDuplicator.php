<?php

namespace Solspace\Freeform\Bundles\Persistence\Duplication;

use craft\helpers\StringHelper;
use Solspace\Freeform\Fields\Implementations\Pro\GroupField;
use Solspace\Freeform\Form\Managers\ContentManager;
use Solspace\Freeform\Library\Helpers\StringHelper as FreeformStringHelper;
use Solspace\Freeform\Records\Form\FormFieldRecord;
use Solspace\Freeform\Records\Form\FormIntegrationRecord;
use Solspace\Freeform\Records\Form\FormLayoutRecord;
use Solspace\Freeform\Records\Form\FormNotificationRecord;
use Solspace\Freeform\Records\Form\FormPageRecord;
use Solspace\Freeform\Records\Form\FormRowRecord;
use Solspace\Freeform\Records\FormRecord;
use Solspace\Freeform\Services\FormsService;
use yii\db\ActiveRecord;

class FormDuplicator
{
    /** @var FormLayoutRecord[] */
    private array $layouts;

    /** @var FormLayoutRecord[] */
    private array $layoutsUids = [];

    /** @var FormPageRecord[] */
    private array $pages;

    /** @var FormRowRecord[] */
    private array $rows;

    /** @var FormFieldRecord[] */
    private array $fields;

    /** @var FormNotificationRecord[] */
    private array $notifications;

    /** @var FormIntegrationRecord[] */
    private array $integrations;

    public function __construct(
        private FormsService $formsService,
    ) {}

    public function clone(int $id): bool
    {
        $form = $this->cloneForm($id);
        if (!$form) {
            return false;
        }

        $this->warmUpLayout($id);

        $this->cloneLayouts($form);
        $this->clonePages($form);
        $this->cloneRows($form);
        $this->cloneFields($form);

        $form = $this->formsService->getFormById($form->id);

        $contentManager = new ContentManager($form, $this->fields);
        $contentManager->performDatabaseColumnAlterations();

        return true;
    }

    private function cloneForm(int $id): ?FormRecord
    {
        $formRecord = FormRecord::findOne(['id' => $id]);
        if (!$formRecord) {
            return null;
        }

        $clone = new FormRecord();
        $clone->setAttributes($formRecord->getAttributes(), false);
        $clone->uid = StringHelper::UUID();
        $clone->id = null;
        $clone->name = FreeformStringHelper::incrementStringWithNumber($formRecord->name, true);
        $clone->handle = FreeformStringHelper::incrementStringWithNumber($formRecord->handle);

        $i = 0;
        do {
            $metadata = json_decode($clone->metadata);
            $metadata->general->name = $clone->name;
            $metadata->general->handle = $clone->handle;
            $clone->metadata = json_encode($metadata);

            $clone->save();

            if ($clone->hasErrors('handle')) {
                $clone->name = FreeformStringHelper::incrementStringWithNumber($clone->name, true);
                $clone->handle = FreeformStringHelper::incrementStringWithNumber($clone->handle);
            }
        } while ($clone->hasErrors() || $i++ > 1000);

        if ($clone->hasErrors()) {
            return null;
        }

        return $clone;
    }

    private function cloneLayouts(FormRecord $form)
    {
        foreach ($this->layouts as $id => $layout) {
            $clone = new FormLayoutRecord();
            $clone->setAttributes($layout->getAttributes(), false);
            $clone->uid = StringHelper::UUID();
            $clone->id = null;
            $clone->formId = $form->id;
            $clone->save();

            if ($clone->hasErrors()) {
                continue;
            }

            $this->layouts[$id] = $clone;
            $this->layoutsUids[$layout->uid] = $clone;
        }
    }

    private function clonePages(FormRecord $form)
    {
        foreach ($this->pages as $id => $page) {
            $clone = new FormPageRecord();
            $clone->setAttributes($page->getAttributes(), false);
            $clone->uid = StringHelper::UUID();
            $clone->id = null;
            $clone->formId = $form->id;
            $clone->layoutId = $this->layouts[$page->layoutId]->id;
            $clone->save();

            if ($clone->hasErrors()) {
                continue;
            }

            $this->pages[$id] = $clone;
        }
    }

    private function cloneRows(FormRecord $form)
    {
        foreach ($this->rows as $id => $row) {
            $clone = new FormRowRecord();
            $clone->setAttributes($row->getAttributes(), false);
            $clone->uid = StringHelper::UUID();
            $clone->id = null;
            $clone->formId = $form->id;
            $clone->layoutId = $this->layouts[$row->layoutId]->id;
            $clone->save();

            if ($clone->hasErrors()) {
                continue;
            }

            $this->rows[$id] = $clone;
        }
    }

    private function cloneFields(FormRecord $form)
    {
        foreach ($this->fields as $id => $field) {
            $clone = new FormFieldRecord();
            $clone->setAttributes($field->getAttributes(), false);
            $clone->uid = StringHelper::UUID();
            $clone->id = null;
            $clone->formId = $form->id;
            $clone->rowId = $this->rows[$field->rowId]->id;

            if (GroupField::class === $clone->type) {
                $metadata = json_decode($clone->metadata);
                $metadata->layout = $this->layoutsUids[$metadata->layout]->uid;
                $clone->metadata = json_encode($metadata);
            }

            $clone->save();

            if ($clone->hasErrors()) {
                continue;
            }

            $this->fields[$id] = $clone;
        }
    }

    private function warmUpLayout(int $formId): void
    {
        $this->layouts = $this->fetchRecords(FormLayoutRecord::class, $formId);
        $this->layoutsUids = $this->fetchRecords(FormLayoutRecord::class, $formId, 'uid');
        $this->pages = $this->fetchRecords(FormPageRecord::class, $formId);
        $this->rows = $this->fetchRecords(FormRowRecord::class, $formId);
        $this->fields = $this->fetchRecords(FormFieldRecord::class, $formId);
        $this->notifications = $this->fetchRecords(FormNotificationRecord::class, $formId);
        $this->integrations = $this->fetchRecords(FormIntegrationRecord::class, $formId);
    }

    private function fetchRecords(string $recordClass, int $formId, string $indexBy = 'id'): array
    {
        // @var ActiveRecord $recordClass
        return $recordClass::find()
            ->where(['formId' => $formId])
            ->indexBy($indexBy)
            ->all()
        ;
    }
}
