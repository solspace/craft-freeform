<?php

namespace Solspace\Freeform\Bundles\Fields\Validation;

use Solspace\Freeform\Bundles\Fields\Validation\Helpers\FileUploadValidationHelper;
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
        private FilesService $filesService,
        private FileUploadValidationHelper $validationHelper,
    ) {
        Event::on(
            FieldInterface::class,
            FieldInterface::EVENT_VALIDATE,
            [$this, 'validate']
        );
    }

    public function validate(ValidateEvent $event): void
    {
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

        if (\is_array($name)) {
            $field->addError(Freeform::t('Multiple field uploads not supported'));

            return;
        }

        if ($field->isRequired() && !$isUploaded) {
            $field->addError(Freeform::t('This field is required'));
        }

        $validExtensions = $this->filesService->getValidExtensions($field);
        $this->validationHelper->validateFileEntry(
            [
                'name' => $name,
                'tmp_name' => $tmpName,
                'size' => $size,
                'error' => $file['error'] ?? \UPLOAD_ERR_NO_FILE,
                'type' => $file['type'] ?? '',
            ],
            $validExtensions,
            $field->getMaxFileSizeKB(),
            static fn (string $message) => $field->addError($message),
        );
    }
}
