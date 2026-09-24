<?php

namespace Solspace\Freeform\Bundles\Fields\Validation;

use craft\helpers\Assets;
use Solspace\Freeform\Bundles\Fields\Implementations\FileUpload\FileUploadAssetBundle;
use Solspace\Freeform\Bundles\Fields\Validation\Helpers\FileUploadValidationHelper;
use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\FileUploadField;
use Solspace\Freeform\Fields\Implementations\Pro\FileDragAndDropField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Helpers\FileHelper;
use Solspace\Freeform\Library\Security\RemoteUrlValidator;
use Solspace\Freeform\Services\FilesService;
use yii\base\Event;
use yii\base\InvalidArgumentException;

class FileUploadValidation extends FeatureBundle
{
    public function __construct(
        private FilesService $filesService,
        private FileUploadValidationHelper $validationHelper,
        private ?RemoteUrlValidator $remoteUrlValidator = null,
    ) {
        $this->remoteUrlValidator ??= new RemoteUrlValidator();

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
        if (!$field instanceof FileUploadField || $field instanceof FileDragAndDropField) {
            return;
        }

        if (!isset(FileUploadAssetBundle::$filesUploaded[$field->getHandle()])) {
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

        $exists = isset($_FILES[$handle]);
        if ($exists) {
            $files = $this->validationHelper->normalizeFilesInput($_FILES[$handle]);
            $fileCount = \count($files);

            if ($fileCount > $field->getFileCount()) {
                $field->addError(
                    Freeform::t(
                        'Tried uploading {count} files. Maximum {max} files allowed.',
                        ['max' => $field->getFileCount(), 'count' => $fileCount]
                    )
                );
            }

            $validExtensions = $this->filesService->getValidExtensions($field);
            foreach ($files as $file) {
                if ($this->validationHelper->validateFileEntry(
                    $file,
                    $validExtensions,
                    $field->getMaxFileSizeKB(),
                    static fn (string $message) => $field->addError($message),
                )) {
                    ++$uploadedFiles;
                }
            }
        }

        if (!$uploadedFiles && $field->isRequired()) {
            $field->addError(Freeform::t('This field is required'));
        }

        // if there are errors - prevent the file from being uploaded
        if ($field->hasErrors()) {
            FileUploadAssetBundle::$filesUploaded[$handle] = null;
        }

        FileUploadAssetBundle::$filesUploadedErrors[$handle] = $field->hasErrors();
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
                    try {
                        $this->remoteUrlValidator->validate($fileUpload['url']);
                    } catch (\InvalidArgumentException) {
                        $field->addError(
                            Freeform::t('The remote file URL must use HTTP or HTTPS and resolve to a public IP address')
                        );
                    }

                    if (empty($fileUpload['filename'])) {
                        // Make up a filename
                        try {
                            $path = parse_url($fileUpload['url'], \PHP_URL_PATH);
                        } catch (\ValueError) {
                            $path = '';
                        }

                        $fileUpload['filename'] = pathinfo((string) $path, \PATHINFO_BASENAME);
                    }

                    $extension = pathinfo($fileUpload['filename'], \PATHINFO_EXTENSION);
                    if (!\in_array(strtolower($extension), $validExtensions, true)) {
                        $field->addError(
                            Freeform::t(
                                "'{extension}' is not an allowed file extension",
                                ['extension' => $extension]
                            )
                        );
                    }

                    ++$uploadedFiles;
                }
            }
        }

        if (!$uploadedFiles && $field->isRequired()) {
            $field->addError(Freeform::t('This field is required'));
        }

        if ($uploadErrors) {
            FileUploadAssetBundle::$filesUploaded[$handle] = null;
        }

        FileUploadAssetBundle::$filesUploadedErrors[$handle] = $uploadErrors;

        $form->setGraphQLArguments($arguments);
    }
}
