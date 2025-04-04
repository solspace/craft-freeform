<?php

namespace Solspace\Freeform\Bundles\Fields\Implementations\FileUpload;

use Solspace\Freeform\Events\Forms\HandleRequestEvent;
use Solspace\Freeform\Fields\Implementations\FileUploadField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Exceptions\FieldExceptions\FileUploadException;
use Solspace\Freeform\Services\FilesService;
use yii\base\Event;

class FileUploadAssetBundle extends FeatureBundle
{
    /**
     * Cache for handles meant for preventing duplicate file uploads when calling ::validate() and ::uploadFile()
     * Stores the assetID once as value for handle key.
     */
    public static array $filesUploaded = [];

    /**
     * Contains any errors for a given upload field.
     */
    public static array $filesUploadedErrors = [];

    public function __construct(private FilesService $filesService)
    {
        Event::on(
            Form::class,
            Form::EVENT_AFTER_HANDLE_REQUEST,
            [$this, 'uploadFiles']
        );
    }

    public static function getPriority(): int
    {
        return 0;
    }

    public function uploadFiles(HandleRequestEvent $event): void
    {
        $form = $event->getForm();
        if (!$form->isValid() || $event->isLookupCall()) {
            return;
        }

        $uploadFields = $form->getLayout()->getFields(FileUploadField::class);
        if (!$uploadFields->count()) {
            return;
        }

        $bag = $form->getProperties();
        $storedValues = $bag->get(Form::PROPERTY_STORED_VALUES, []);

        foreach ($uploadFields as $field) {
            $handle = $field->getHandle();

            if (!isset(self::$filesUploaded[$handle])) {
                $response = $this->filesService->uploadFile($field, $form);

                self::$filesUploaded[$handle] = null;
                self::$filesUploadedErrors[$handle] = [];

                if ($response) {
                    if ($response->getAssetIds() || empty($response->getErrors())) {
                        $field->setValue($response->getAssetIds());
                        self::$filesUploaded[$handle] = $response->getAssetIds();

                        $storedValues[$handle] = $field->getValue();

                        continue;
                    }

                    $field->addErrors($response->getErrors());
                    self::$filesUploadedErrors[$handle] = $field->getErrors();

                    throw new FileUploadException(implode('. ', $response->getErrors()));
                }
            }

            if (!empty(self::$filesUploadedErrors[$handle])) {
                $field->addErrors(self::$filesUploadedErrors[$handle]);
            }
        }

        $bag->set(Form::PROPERTY_STORED_VALUES, $storedValues);
    }
}
