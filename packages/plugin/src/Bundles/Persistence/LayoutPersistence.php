<?php

namespace Solspace\Freeform\Bundles\Persistence;

use craft\db\ActiveRecord;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\controllers\api\FormsController;
use Solspace\Freeform\Events\Forms\PersistFormEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Records\Form\FormFieldRecord;
use Solspace\Freeform\Records\Form\FormLayoutRecord;
use Solspace\Freeform\Records\Form\FormPageRecord;
use Solspace\Freeform\Records\Form\FormRowRecord;
use yii\base\Event;

class LayoutPersistence extends FeatureBundle
{
    private array $cache = [];
    private array $rowContents = [];

    public function __construct(
        private PropertyProvider $propertyProvider,
    ) {
        Event::on(
            FormsController::class,
            FormsController::EVENT_UPSERT_FORM,
            [$this, 'handleLayoutSave']
        );
    }

    public static function getPriority(): int
    {
        return 300;
    }

    public function handleLayoutSave(PersistFormEvent $event): void
    {
        $form = $event->getForm();
        if (!$form) {
            return;
        }

        $payload = $event->getPayload()->layout ?? null;
        if (!$payload) {
            return;
        }

        $pages = $payload->pages;
        $layouts = $payload->layouts;
        $rows = $payload->rows;
        $fields = $payload->fields;

        $this->saveLayouts($form, $layouts);
        $this->savePages($form, $pages, $event);
        $this->saveRows($form, $rows);
        $this->saveFields($form, $fields, $event);

        $this->cleanupOrphans();
    }

    private function saveLayouts(Form $form, array $data): void
    {
        [$existingRecords, $staleUids] = $this->getStarterPack($form, $data, FormLayoutRecord::class);

        foreach ($data as $item) {
            $record = $existingRecords[$item->uid] ?? null;
            if ($record) {
                continue;
            }

            $record = new FormLayoutRecord();
            $record->formId = $form->getId();
            $record->uid = $item->uid;
            $record->save();
        }

        foreach ($staleUids as $uid) {
            $existingRecords[$uid]->delete();
        }
    }

    private function savePages(Form $form, array $data, PersistFormEvent $event): void
    {
        [$existingRecords, $staleUids] = $this->getStarterPack($form, $data, FormPageRecord::class);

        foreach ($data as $item) {
            $uid = $item->uid;

            $record = $existingRecords[$uid] ?? null;
            if (!$record) {
                $record = new FormPageRecord();
                $record->uid = $uid;
                $record->formId = $form->getId();
                $record->layoutId = $this->getRecordId($form, FormLayoutRecord::class, $item->layoutUid);
            }

            $record->label = $item->label;
            $record->order = $item->order;
            $record->metadata = ['buttons' => $item->buttons];

            $record->save();
            $event->addPageRecord($record);
        }

        foreach ($staleUids as $uid) {
            $existingRecords[$uid]->delete();
        }
    }

    private function saveRows(Form $form, array $data): void
    {
        [$existingRecords, $staleUids] = $this->getStarterPack($form, $data, FormRowRecord::class);

        foreach ($data as $item) {
            $uid = $item->uid;

            $record = $existingRecords[$uid] ?? null;
            if (!$record) {
                $record = new FormRowRecord();
                $record->uid = $uid;
                $record->formId = $form->getId();
                $record->layoutId = $this->getRecordId($form, FormLayoutRecord::class, $item->layoutUid);
            }

            $record->order = $item->order;
            $record->save();

            if (!$record->hasErrors()) {
                $this->rowContents[$uid] = [];
            }
        }

        foreach ($staleUids as $uid) {
            $existingRecords[$uid]->delete();
        }
    }

    private function saveFields(Form $form, array $data, $event): void
    {
        [$existingRecords, $staleUids] = $this->getStarterPack($form, $data, FormFieldRecord::class);

        foreach ($data as $item) {
            $uid = $item->uid;
            $type = $item->typeClass ?? null;
            if (!$type) {
                continue;
            }

            $record = $existingRecords[$uid] ?? null;
            if (!$record) {
                $record = new FormFieldRecord();
                $record->uid = $item->uid;
                $record->formId = $form->getId();
            }

            $record->rowId = $this->getRecordId($form, FormRowRecord::class, $item->rowUid);
            $record->order = $item->order ?? 0;
            $record->type = $item->typeClass;
            $record->metadata = $this->getValidatedMetadata($item, $event);
            $record->save();

            if (!$record->hasErrors()) {
                $this->rowContents[$item->rowUid][] = $uid;
            }

            if ($record->hasErrors()) {
                $event->addErrorsToResponse(
                    'fields',
                    [$item->uid => $record->getErrors()]
                );
            } else {
                $event->addFieldRecord($record);
            }
        }

        foreach ($staleUids as $uid) {
            $existingRecords[$uid]->delete();
        }
    }

    private function getStarterPack(Form $form, array $data, string $recordType): array
    {
        $usedUids = array_map(fn ($item) => $item->uid, $data);
        $existingRecords = $this->getRecords($recordType, $form);
        $existingUids = array_keys($existingRecords);

        $staleUids = array_diff($existingUids, $usedUids);

        return [
            $existingRecords,
            $staleUids,
        ];
    }

    /**
     * @param class-string<ActiveRecord> $recordType
     */
    private function getRecordId(Form $form, string $recordType, ?string $uid): ?int
    {
        if (null === $uid) {
            return null;
        }

        $cache = $this->cache[$recordType][$form->getId()] ?? null;
        if (!$cache) {
            $this->cache[$recordType][$form->getId()] = $recordType::find()
                ->select(['id'])
                ->where(['formId' => $form->getId()])
                ->indexBy('uid')
                ->column()
            ;
        }

        return $this->cache[$recordType][$form->getId()][$uid] ?? null;
    }

    /**
     * @param class-string<ActiveRecord> $class
     */
    private function getRecords(string $class, Form $form): array
    {
        return $class::find()
            ->where(['formId' => $form->getId()])
            ->indexBy('uid')
            ->all()
        ;
    }

    private function cleanupOrphans(): void
    {
        foreach ($this->rowContents as $rowUid => $contents) {
            if (empty($contents)) {
                FormRowRecord::deleteAll(['uid' => $rowUid]);
            }
        }
    }

    private function getValidatedMetadata(\stdClass $fieldData, PersistFormEvent $event): array
    {
        $properties = $this->propertyProvider->getEditableProperties($fieldData->typeClass);

        $metadata = [];
        foreach ($properties as $property) {
            $handle = $property->handle;
            $value = $fieldData->properties->{$handle} ?? null;

            $errors = [];
            foreach ($property->validators as $validator) {
                $errors = array_merge($errors, $validator->validate($value));
            }

            if ($errors) {
                $event->addErrorsToResponse(
                    'fields',
                    [$fieldData->uid => [$property->handle => $errors]]
                );
            }

            $metadata[$handle] = $value;
        }

        return $metadata;
    }
}
