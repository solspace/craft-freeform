<?php

namespace Solspace\Freeform\Bundles\Fields\Validation;

use craft\helpers\Assets;
use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Events\Forms\ValidationEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\FileUploadField;
use Solspace\Freeform\Fields\Implementations\Pro\FileDragAndDropField;
use Solspace\Freeform\Fields\Interfaces\FileUploadInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Exceptions\FieldExceptions\FileUploadException;
use Solspace\Freeform\Library\Helpers\FileHelper;
use Solspace\Freeform\Services\FilesService;
use yii\base\Event;
use yii\base\InvalidArgumentException;

class FileUploadValidation extends FeatureBundle
{
    private const FILE_KEYS = [
        'name',
        'tmp_name',
        'error',
        'size',
        'type',
    ];

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

        Event::on(
            Form::class,
            Form::EVENT_AFTER_VALIDATE,
            [$this, 'uploadFiles']
        );
    }

    public function uploadFiles(ValidationEvent $event): void
    {
        $form = $event->getForm();
        $uploadFields = $form->getLayout()->getFields(FileUploadInterface::class);

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

                        return;
                    }

                    $field->addErrors($response->getErrors());
                    self::$filesUploadedErrors[$handle] = $field->getErrors();

                    throw new FileUploadException(implode('. ', $response->getErrors()));
                }

                return;
            }

            if (!empty(self::$filesUploadedErrors[$handle])) {
                $field->addErrors(self::$filesUploadedErrors[$handle]);
            }
        }
    }

    public function validate(ValidateEvent $event): void
    {
        $form = $event->getForm();
        $field = $event->getField();
        if (!$field instanceof FileUploadField || $field instanceof FileDragAndDropField) {
            return;
        }

        if (!isset(self::$filesUploaded[$field->getHandle()])) {
            if ($form->isGraphQLPosted()) {
                $this->validateGQL($form, $field);
            } else {
                $this->validatePost($field);
            }
        }
    }

    private function validatePost(FileUploadField $field): void
    {
        $uploadedFiles = 0;
        $handle = $field->getHandle();

        $exists = isset($_FILES[$handle]) && !empty($_FILES[$handle]['name']);

        if ($exists && !\is_array($_FILES[$handle]['name'])) {
            foreach (self::FILE_KEYS as $key) {
                $_FILES[$handle][$key] = [$_FILES[$handle][$key]];
            }
        }

        if ($exists && is_countable($_FILES[$handle]['name'])) {
            $fileCount = \count($_FILES[$handle]['name']);

            if ($fileCount > $field->getFileCount()) {
                $field->addError(
                    Freeform::t(
                        'Tried uploading {count} files. Maximum {max} files allowed.',
                        ['max' => $field->getFileCount(), 'count' => $fileCount]
                    )
                );
            }

            foreach ($_FILES[$handle]['name'] as $index => $name) {
                $extension = pathinfo($name, \PATHINFO_EXTENSION);
                $validExtensions = $this->filesService->getValidExtensions($field);

                $tmpName = $_FILES[$handle]['tmp_name'][$index];
                $errorCode = $_FILES[$handle]['error'][$index];

                if (empty($tmpName) && \UPLOAD_ERR_NO_FILE === $errorCode) {
                    continue;
                }

                // Check the mime type if the server supports it
                if (FileHelper::isMimeTypeCheckEnabled() && !empty($tmpName)) {
                    $mimeType = FileHelper::getMimeType($tmpName);
                    $mimeExtension = FileHelper::getExtensionByMimeType($mimeType);

                    if ($mimeExtension) {
                        $extension = $mimeExtension;
                    } else {
                        $field->addError(Freeform::t('Unknown file type'));
                    }
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
                    $field->addError(
                        Freeform::t(
                            "'{extension}' is not an allowed file extension",
                            ['extension' => $extension]
                        )
                    );
                }

                $fileSizeKB = ceil($_FILES[$handle]['size'][$index] / 1024);
                if ($fileSizeKB > $field->getMaxFileSizeKB()) {
                    $field->addError(
                        Freeform::t(
                            'You tried uploading {fileSize}KB, but the maximum file upload size is {maxFileSize}KB',
                            ['fileSize' => $fileSizeKB, 'maxFileSize' => $field->getMaxFileSizeKB()]
                        )
                    );
                }

                ++$uploadedFiles;
            }
        }

        if (!$uploadedFiles && $field->isRequired()) {
            $field->addError(Freeform::t('This field is required'));
        }

        // if there are errors - prevent the file from being uploaded
        if ($field->hasErrors()) {
            self::$filesUploaded[$handle] = null;
        }

        self::$filesUploadedErrors[$handle] = $field->hasErrors();
    }

    private function validateGQL(Form $form, FileUploadField $field): void
    {
        $uploadedFiles = 0;
        $uploadErrors = [];

        $handle = $field->getHandle();

        $validExtensions = $this->filesService->getValidExtensions($field);
        $arguments = $form->getGraphQLArguments();
        $filesService = $this->filesService;

        if (isset($arguments[$handle])) {
            $fileCount = \count($arguments[$handle]);

            if ($fileCount > $field->getFileCount()) {
                $field->addError(
                    Freeform::t(
                        'Tried uploading {count} files. Maximum {max} files allowed.',
                        ['max' => $field->getFileCount(), 'count' => $fileCount]
                    )
                );
            }

            foreach ($arguments[$handle] as &$fileUpload) {
                if (!empty($fileUpload['fileData'])) {
                    $matches = $filesService->extractBase64String($fileUpload);
                    $fileData = base64_decode($matches['data']);

                    if ($fileData) {
                        if (empty($fileUpload['filename'])) {
                            // Make up a filename
                            $extension = null;

                            if (FileHelper::isMimeTypeCheckEnabled() && !empty($matches['type'])) {
                                try {
                                    $extension = FileHelper::getExtensionByMimeType($matches['type']);
                                } catch (InvalidArgumentException) {
                                }

                                if (!$extension) {
                                    $field->addError(
                                        Freeform::t(
                                            'Unknown file type provided: {type}',
                                            ['type' => $matches['type']]
                                        )
                                    );
                                }
                            }

                            $fileUpload['filename'] = 'Upload.'.$extension;
                        }

                        $filename = Assets::prepareAssetName($fileUpload['filename']);
                        $extension = pathinfo($filename, \PATHINFO_EXTENSION);

                        // Valid the extension
                        if (!\in_array(strtolower($extension), $validExtensions, true)) {
                            $field->addError(
                                Freeform::t(
                                    "'{extension}' is not an allowed file extension",
                                    ['extension' => $extension]
                                )
                            );
                        }

                        // Cannot get the file size without moving to temp folder
                        $tempPath = $filesService->moveToBase64FileTempFolder($fileUpload, $extension);
                        $fileSizeKB = ceil(filesize($tempPath) / 1024);

                        if ($fileSizeKB > $field->getMaxFileSizeKB()) {
                            $field->addError(
                                Freeform::t(
                                    'You tried uploading {fileSize}KB, but the maximum file upload size is {maxFileSize}KB',
                                    ['fileSize' => $fileSizeKB, 'maxFileSize' => $field->getMaxFileSizeKB()]
                                )
                            );
                        }

                        ++$uploadedFiles;
                    } else {
                        $field->addError(Freeform::t('Invalid file data provided'));
                    }
                } elseif (!empty($fileUpload['url'])) {
                    if (empty($fileUpload['filename'])) {
                        // Make up a filename
                        $url = parse_url($fileUpload['url']);
                        $filename = pathinfo($url['path'], \PATHINFO_FILENAME);
                        $extension = pathinfo($url['path'], \PATHINFO_EXTENSION);

                        $fileUpload['filename'] = $filename.'.'.$extension;
                    }

                    ++$uploadedFiles;
                }
            }
        }

        if (!$uploadedFiles && $field->isRequired()) {
            $field->addError(Freeform::t('This field is required'));
        }

        if ($uploadErrors) {
            self::$filesUploaded[$handle] = null;
        }

        self::$filesUploadedErrors[$handle] = $uploadErrors;

        $form->setGraphQLArguments($arguments);
    }
}
