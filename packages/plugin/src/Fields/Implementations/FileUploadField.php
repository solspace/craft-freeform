<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2022, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Fields\Implementations;

use craft\elements\Asset;
use craft\elements\db\AssetQuery;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\Interfaces\FileUploadInterface;
use Solspace\Freeform\Fields\Interfaces\MultiValueInterface;
use Solspace\Freeform\Fields\Traits\FileUploadTrait;
use Solspace\Freeform\Fields\Traits\MultipleValueTrait;
use Solspace\Freeform\Library\Exceptions\FieldExceptions\FileUploadException;
use Solspace\Freeform\Library\Helpers\FileHelper;

use function Solspace\Freeform\Fields\is_countable;

#[Type(
    name: 'File Upload',
    typeShorthand: 'file',
    iconPath: __DIR__.'/Icons/text.svg',
)]
class FileUploadField extends AbstractField implements MultiValueInterface, FileUploadInterface
{
    use FileUploadTrait;
    use MultipleValueTrait;

    public const DEFAULT_MAX_FILESIZE_KB = 2048;
    public const DEFAULT_FILE_COUNT = 1;

    public const FILE_KEYS = [
        'name',
        'tmp_name',
        'error',
        'size',
        'type',
    ];

    #[Property]
    protected array $fileKinds = ['image', 'document'];

    #[Property(
        label: 'Maximum File Size',
        instructions: 'Specify the maximum file size, in KB.',
    )]
    protected int $maxFileSizeKB = 2048;

    #[Property(
        instructions: 'Specify the maximum uploadable file count.',
    )]
    protected int $fileCount = 1;

    /**
     * Cache for handles meant for preventing duplicate file uploads when calling ::validate() and ::uploadFile()
     * Stores the assetID once as value for handle key.
     */
    private static array $filesUploaded = [];

    /**
     * Contains any errors for a given upload field.
     */
    private static array $filesUploadedErrors = [];

    public function getType(): string
    {
        return self::TYPE_FILE;
    }

    public function getAssets(): AssetQuery
    {
        return Asset::find()->id($this->getValue());
    }

    public function getFileKinds(): array
    {
        if (!\is_array($this->fileKinds)) {
            return [];
        }

        return $this->fileKinds;
    }

    public function getMaxFileSizeKB(): int
    {
        return $this->maxFileSizeKB ?: self::DEFAULT_MAX_FILESIZE_KB;
    }

    public function getMaxFileSizeBytes(): int
    {
        return $this->getMaxFileSizeKB() * 1000;
    }

    public function getFileCount(): int
    {
        return $this->fileCount <= 1 ? 1 : (int) $this->fileCount;
    }

    public function getInputHtml(): string
    {
        $attributes = $this->attributes->getInput()
            ->clone()
            ->setIfEmpty('name', $this->getHandle().'[]')
            ->setIfEmpty('type', $this->getType())
            ->setIfEmpty('id', $this->getIdAttribute())
            ->set('multiple', $this->getFileCount() > 1)
            ->set($this->getRequiredAttribute())
        ;

        return '<input'.$attributes.' />';
    }

    /**
     * Attempt to upload the file to its respective location.
     *
     * @return null|array - asset IDs
     *
     * @throws FileUploadException
     */
    public function uploadFile()
    {
        if (!isset(self::$filesUploaded[$this->handle])) {
            $response = $this->getForm()->getFileUploadHandler()->uploadFile($this, $this->getForm());

            self::$filesUploaded[$this->handle] = null;
            self::$filesUploadedErrors[$this->handle] = [];

            if ($response) {
                $errors = $this->getErrors() ?: [];

                if ($response->getAssetIds() || empty($response->getErrors())) {
                    $this->values = $response->getAssetIds();
                    self::$filesUploaded[$this->handle] = $response->getAssetIds();

                    return $this->values;
                }

                if ($response->getErrors()) {
                    $this->errors = array_merge($errors, $response->getErrors());
                    self::$filesUploadedErrors[$this->handle] = $this->errors;

                    throw new FileUploadException(implode('. ', $response->getErrors()));
                }

                $this->errors = array_merge($errors, $response->getErrors());
                self::$filesUploadedErrors[$this->handle] = $this->errors;

                throw new FileUploadException($this->translate('Could not upload file'));
            }

            return null;
        }

        if (!empty(self::$filesUploadedErrors[$this->handle])) {
            $this->errors = self::$filesUploadedErrors[$this->handle];
        }

        return self::$filesUploaded[$this->handle];
    }

    /**
     * Validate the field and add error messages if any.
     */
    protected function validate(): array
    {
        $uploadErrors = [];

        $handle = $this->handle;
        if (!isset(self::$filesUploaded[$handle])) {
            $exists = isset($_FILES[$handle]) && !empty($_FILES[$handle]['name']) && !$this->isHidden();

            if ($exists && !\is_array($_FILES[$handle]['name'])) {
                foreach (self::FILE_KEYS as $key) {
                    $_FILES[$handle][$key] = [$_FILES[$handle][$key]];
                }
            }

            $uploadedFiles = 0;
            if ($exists && is_countable($_FILES[$handle]['name'])) {
                $fileCount = \count($_FILES[$handle]['name']);

                if ($fileCount > $this->getFileCount()) {
                    $uploadErrors[] = $this->translate(
                        'Tried uploading {count} files. Maximum {max} files allowed.',
                        ['max' => $this->getFileCount(), 'count' => $fileCount]
                    );
                }

                foreach ($_FILES[$handle]['name'] as $index => $name) {
                    $extension = pathinfo($name, \PATHINFO_EXTENSION);
                    $validExtensions = $this->getValidExtensions();

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
                            $uploadErrors[] = $this->translate(
                                'Unknown file type'
                            );
                        }
                    }

                    if (empty($tmpName)) {
                        switch ($errorCode) {
                            case \UPLOAD_ERR_INI_SIZE:
                            case \UPLOAD_ERR_FORM_SIZE:
                                $uploadErrors[] = $this->translate('File size too large');

                                break;

                            case \UPLOAD_ERR_PARTIAL:
                                $uploadErrors[] = $this->translate('The file was only partially uploaded');

                                break;
                        }
                        $uploadErrors[] = $this->translate('Could not upload file');
                    }

                    // Check for the correct file extension
                    if (!\in_array(strtolower($extension), $validExtensions, true)) {
                        $uploadErrors[] = $this->translate(
                            "'{extension}' is not an allowed file extension",
                            ['extension' => $extension]
                        );
                    }

                    $fileSizeKB = ceil($_FILES[$handle]['size'][$index] / 1024);
                    if ($fileSizeKB > $this->getMaxFileSizeKB()) {
                        $uploadErrors[] = $this->translate(
                            'You tried uploading {fileSize}KB, but the maximum file upload size is {maxFileSize}KB',
                            ['fileSize' => $fileSizeKB, 'maxFileSize' => $this->getMaxFileSizeKB()]
                        );
                    }

                    ++$uploadedFiles;
                }
            }

            if (!$uploadedFiles && $this->isRequired() && !$this->isHidden()) {
                $uploadErrors[] = $this->translate('This field is required');
            }

            // if there are errors - prevent the file from being uploaded
            if ($uploadErrors || $this->isHidden()) {
                self::$filesUploaded[$handle] = null;
            }

            self::$filesUploadedErrors[$handle] = $uploadErrors;
        }

        return self::$filesUploadedErrors[$handle];
    }

    /**
     * Returns an array of all valid file extensions for this field.
     */
    protected function getValidExtensions(): array
    {
        $allFileKinds = $this->getForm()->getFileUploadHandler()->getFileKinds();

        $selectedFileKinds = $this->getFileKinds();

        $allowedExtensions = [];
        if ($selectedFileKinds) {
            foreach ($selectedFileKinds as $kind) {
                if (isset($allFileKinds[$kind])) {
                    $allowedExtensions = array_merge($allowedExtensions, $allFileKinds[$kind]);
                }
            }
        } else {
            $allowedExtensions = \Craft::$app->getConfig()->getGeneral()->allowedFileExtensions;
        }

        return $allowedExtensions;
    }
}
