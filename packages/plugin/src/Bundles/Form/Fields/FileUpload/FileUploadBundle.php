<?php

namespace Solspace\Freeform\Bundles\Form\Fields\FileUpload;

use Solspace\Freeform\Events\Fields\TransformValueEvent;
use Solspace\Freeform\Events\Forms\SubmitEvent;
use Solspace\Freeform\Fields\FileUploadField;
use Solspace\Freeform\Fields\Pro\FileDragAndDropField;
use Solspace\Freeform\Library\Bundles\BundleInterface;
use Solspace\Freeform\Library\Composer\Components\FieldInterface;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Records\UnfinalizedFileRecord;
use yii\base\Event;

class FileUploadBundle implements BundleInterface
{
    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_AFTER_SUBMIT, [$this, 'finalizeFiles']);
        Event::on(FieldInterface::class, FieldInterface::EVENT_TRANSFORM_FROM_POST, [$this, 'handleDnDPost']);
    }

    public function finalizeFiles(SubmitEvent $event)
    {
        $form = $event->getForm();
        $submission = $event->getSubmission();

        // Handle only stored submissions
        if (!$submission->id) {
            return;
        }

        $fields = $form->getLayout()->getFields(FileUploadField::class);
        $assetIds = [];
        foreach ($fields as $field) {
            $assetIds = array_merge($assetIds, $field->getValue());
        }

        if (empty($assetIds)) {
            return;
        }

        $records = UnfinalizedFileRecord::findAll(['assetId' => $assetIds]);
        foreach ($records as $record) {
            $record->delete();
        }
    }

    public function handleDnDPost(TransformValueEvent $event)
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
            $asset = \Craft::$app->getElements()->getElementByUid($uid);
            if ($asset) {
                $ids[] = $asset->id;
            }
        }

        $event->setValue($ids);
    }
}
