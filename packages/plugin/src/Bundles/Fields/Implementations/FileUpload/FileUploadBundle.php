<?php

namespace Solspace\Freeform\Bundles\Fields\Implementations\FileUpload;

use Carbon\Carbon;
use craft\helpers\StringHelper;
use Solspace\Freeform\Bundles\Form\SaveForm\Events\SaveFormEvent;
use Solspace\Freeform\Bundles\Form\SaveForm\SaveForm;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Fields\TransformValueEvent;
use Solspace\Freeform\Events\Forms\SubmitEvent;
use Solspace\Freeform\Events\Submissions\RenderTableValueEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\FileUploadField;
use Solspace\Freeform\Fields\Implementations\Pro\FileDragAndDropField;
use Solspace\Freeform\Fields\Implementations\Pro\TableField;
use Solspace\Freeform\Fields\Interfaces\FileUploadInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Records\UnfinalizedFileRecord;
use yii\base\Event;

class FileUploadBundle extends FeatureBundle
{
    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_AFTER_SUBMIT, [$this, 'finalizeFiles']);
        Event::on(FieldInterface::class, FieldInterface::EVENT_TRANSFORM_FROM_POST, [$this, 'handleDnDPost']);
        Event::on(FieldInterface::class, FieldInterface::EVENT_TRANSFORM_FROM_POST, [$this, 'handleBasicUploadPost']);
        Event::on(Submission::class, Submission::EVENT_RENDER_TABLE_VALUE, [$this, 'renderTableValue']);
        Event::on(SaveForm::class, SaveForm::EVENT_SAVE_FORM, [$this, 'prolongUnfinalizedAssets']);
    }

    public function prolongUnfinalizedAssets(SaveFormEvent $event): void
    {
        $settingsModel = Freeform::getInstance()->settings->getSettingsModel();

        $saveTimeDays = $settingsModel->saveFormTtl;
        $newDate = new Carbon('now +'.$saveTimeDays.' days', 'UTC');

        $form = $event->getForm();

        $records = $this->getUnfinalizedFileRecords($form);
        foreach ($records as $record) {
            $record->dateCreated = $newDate;
            $record->dateUpdated = $newDate;
            $record->save();
        }
    }

    public function finalizeFiles(SubmitEvent $event): void
    {
        $form = $event->getForm();

        // Handle only finished forms
        if (!$event->getForm()->isFinished()) {
            return;
        }

        $records = $this->getUnfinalizedFileRecords($form);
        foreach ($records as $record) {
            $record->delete();
        }
    }

    public function handleBasicUploadPost(TransformValueEvent $event): void
    {
        $field = $event->getField();
        if (FileUploadField::class !== $field::class) {
            return;
        }

        if (null === $event->getValue()) {
            $event->setValue($field->getValue());
        }
    }

    public function handleDnDPost(TransformValueEvent $event): void
    {
        $field = $event->getField();
        if (!$field instanceof FileDragAndDropField) {
            return;
        }

        $uids = $event->getValue();
        if (!\is_array($uids)) {
            $event->setValue([]);

            return;
        }

        $ids = [];
        foreach ($uids as $uid) {
            if (StringHelper::isUUID($uid)) {
                $asset = \Craft::$app->getElements()->getElementByUid($uid);
            } else {
                $asset = \Craft::$app->assets->getAssetById($uid);
            }

            if ($asset) {
                $ids[] = $asset->id;
            }
        }

        $event->setValue($ids);
    }

    public function renderTableValue(RenderTableValueEvent $event): void
    {
        $field = $event->getField();
        if (!$field instanceof FileUploadField) {
            return;
        }

        $output = '<div class="inline-chips">';
        foreach ($field->getValue() as $assetId) {
            $asset = \Craft::$app->assets->getAssetById((int) $assetId);

            if ($asset) {
                $output .= \Craft::$app->view->renderTemplate(
                    'freeform/_components/fields/file.html',
                    ['asset' => $asset]
                );
            }
        }
        $output .= '</div>';

        $event->setOutput($output);
    }

    /**
     * @return UnfinalizedFileRecord[]
     */
    private function getUnfinalizedFileRecords(Form $form): array
    {
        $assetIds = [];

        /** @var FileUploadInterface[] $fields */
        $fields = $form->getLayout()->getFields(FileUploadField::class);
        foreach ($fields as $field) {
            $assetIds = array_merge($assetIds, $field->getValue() ?? []);
        }

        /** @var TableField[] $tableFields */
        $tableFields = $form->getLayout()->getFields(TableField::class);
        foreach ($tableFields as $tableField) {
            $assetIds = array_merge($assetIds, $this->extractTableFileAssetIds($tableField));
        }

        $assetIds = array_values(array_unique(array_filter(
            array_map('intval', $assetIds),
            static fn (int $id) => $id > 0
        )));

        if (empty($assetIds)) {
            return [];
        }

        return UnfinalizedFileRecord::findAll(['assetId' => $assetIds]);
    }

    private function extractTableFileAssetIds(TableField $field): array
    {
        if (!$field->hasFileUploadColumns()) {
            return [];
        }

        $layout = $field->getTableLayout();
        $fileColumnIndexes = [];
        foreach ($layout as $index => $column) {
            if (TableField::COLUMN_TYPE_FILE === ($column->type ?? null)) {
                $fileColumnIndexes[] = $index;
            }
        }

        if (empty($fileColumnIndexes)) {
            return [];
        }

        $assetIds = [];
        $value = $field->getValue();
        if (!\is_array($value)) {
            return [];
        }

        foreach ($value as $row) {
            if (!\is_array($row)) {
                continue;
            }

            foreach ($fileColumnIndexes as $columnIndex) {
                $cellValue = $row[$columnIndex] ?? [];
                if (!\is_array($cellValue)) {
                    if (null === $cellValue || '' === $cellValue) {
                        $cellValue = [];
                    } else {
                        $cellValue = [$cellValue];
                    }
                }

                $assetIds = array_merge($assetIds, $cellValue);
            }
        }

        return $assetIds;
    }
}
