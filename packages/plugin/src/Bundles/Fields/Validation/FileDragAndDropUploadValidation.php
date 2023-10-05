<?php

namespace Solspace\Freeform\Bundles\Fields\Validation;

use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\Pro\FileDragAndDropField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Services\FilesService;
use yii\base\Event;

class FileDragAndDropUploadValidation extends FeatureBundle
{
    /**
     * Cache for handles meant for preventing duplicate file uploads when calling ::validate() and ::uploadFile()
     * Stores the assetID once as value for handle key.
     */
    private static array $filesUploaded = [];

    /**
     * Contains any errors for a given upload field.
     */
    private static array $filesUploadedErrors = [];

    public function __construct(
        private FilesService $filesService
    ) {
        Event::on(
            FieldInterface::class,
            FieldInterface::EVENT_VALIDATE,
            [$this, 'validate']
        );
    }

    public function validate(ValidateEvent $event): void
    {
        $form = $event->getForm();
        $field = $event->getField();
        if (!$field instanceof FileDragAndDropField) {
            return;
        }

        $handle = $field->getHandle();
        $isUploaded = isset($_FILES[$handle]) && !empty($_FILES[$handle]['name']);

        $file = $_FILES[$handle] ?? null;
        if (!$file) {
            if ($field->isRequired() && empty($field->getValue())) {
                $field->addError(Freeform::t('This field is required'));
            }

            return;
        }

        $name = $file['name'];
        $tmpName = $file['tmp_name'];
        $size = $file['size'];
        $errorCode = $file['error'];

        if (\is_array($name)) {
            $field->addError(Freeform::t('Multiple field uploads not supported'));
        }

        if ($field->isRequired() && !$isUploaded) {
            $field->addError(Freeform::t('This field is required'));
        }

        $extension = pathinfo($name, \PATHINFO_EXTENSION);
        $validExtensions = $this->filesService->getValidExtensions($field);

        if (empty($tmpName) && \UPLOAD_ERR_NO_FILE === $errorCode) {
            return;
        }

        if (empty($tmpName)) {
            switch ($errorCode) {
                case \UPLOAD_ERR_INI_SIZE:
                case \UPLOAD_ERR_FORM_SIZE:
                    $field->addError(Freeform::t('File size too large'));

                    break;

                case \UPLOAD_ERR_PARTIAL:
                    $field->addError(Freeform::t('The file was only partially uploaded'));

                    break;
            }

            $field->addError(Freeform::t('Could not upload file'));
        }

        // Check for the correct file extension
        if (!\in_array(strtolower($extension), $validExtensions, true)) {
            $field->addError(Freeform::t(
                "'{extension}' is not an allowed file extension",
                ['extension' => $extension]
            ));
        }

        $fileSizeKB = ceil($size / 1024);
        if ($fileSizeKB > $field->getMaxFileSizeKB()) {
            $field->addError(Freeform::t(
                'You tried uploading {fileSize}KB, but the maximum file upload size is {maxFileSize}KB',
                ['fileSize' => $fileSizeKB, 'maxFileSize' => $field->getMaxFileSizeKB()]
            ));
        }
    }
}
