<?php

namespace Solspace\Freeform\Bundles\Persistance;

use craft\db\ActiveRecord;
use Solspace\Freeform\controllers\client\api\FormsController;
use Solspace\Freeform\Events\Forms\PersistFormEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Records\Form\FormCellRecord;
use Solspace\Freeform\Records\Form\FormFieldRecord;
use Solspace\Freeform\Records\Form\FormLayoutRecord;
use Solspace\Freeform\Records\Form\FormPageRecord;
use Solspace\Freeform\Records\Form\FormRowRecord;
use yii\base\Event;

class LayoutPersistence extends FeatureBundle
{
    private array $cache = [];

    public function __construct()
    {
        Event::on(
            FormsController::class,
            FormsController::EVENT_UPSERT_FORM,
            [$this, 'handleFieldSave']
        );
    }

    public static function getPriority(): int
    {
        return 400;
    }

    public function handleFieldSave(PersistFormEvent $event)
    {
        $form = $event->getForm();
        if (!$form) {
            return;
        }

        $payload = $event->getPayload()->layout;

        $pages = $payload->pages;
        $layouts = $payload->layouts;
        $rows = $payload->rows;
        $cells = $payload->cells;

        $this->saveLayouts($form, $layouts);
        $this->savePages($form, $pages);
        $this->saveRows($form, $rows);
        $this->saveCells($form, $cells);
    }

    private function saveLayouts(Form $form, array $data)
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

    private function savePages(Form $form, array $data)
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

            $record->save();
        }

        foreach ($staleUids as $uid) {
            $existingRecords[$uid]->delete();
        }
    }

    private function saveRows(Form $form, array $data)
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
        }

        foreach ($staleUids as $uid) {
            $existingRecords[$uid]->delete();
        }
    }

    private function saveCells(Form $form, array $data)
    {
        [$existingRecords, $staleUids] = $this->getStarterPack($form, $data, FormCellRecord::class);

        foreach ($data as $item) {
            $uid = $item->uid;

            $record = $existingRecords[$uid] ?? null;
            if (!$record) {
                $record = new FormCellRecord();
                $record->uid = $uid;
                $record->formId = $form->getId();
                $record->rowId = $this->getRecordId($form, FormRowRecord::class, $item->rowUid);
                $record->type = $item->type;
                $record->layoutId = $this->getRecordId($form, FormLayoutRecord::class, $item->targetUid);
                $record->fieldId = $this->getRecordId($form, FormFieldRecord::class, $item->targetUid);
            }

            $record->order = $item->order;
            $record->save();
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
    private function getRecordId(Form $form, string $recordType, string $uid): ?int
    {
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
}
