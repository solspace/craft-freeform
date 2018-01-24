<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2016, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Library\Composer\Components\Fields;

use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\FileUploadInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\SingleValueInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Traits\FileUploadTrait;
use Solspace\Freeform\Library\Composer\Components\Fields\Traits\SingleValueTrait;
use Solspace\Freeform\Library\Exceptions\FieldExceptions\FileUploadException;

class FileUploadField extends AbstractField implements SingleValueInterface, FileUploadInterface
{
    const DEFAULT_MAX_FILESIZE_KB = 2048;

    use SingleValueTrait;
    use FileUploadTrait;

    /** @var array */
    protected $fileKinds;

    /** @var int */
    protected $maxFileSizeKB;

    /**
     * Cache for handles meant for preventing duplicate file uploads when calling ::validate() and ::uploadFile()
     * Stores the assetID once as value for handle key
     *
     * @var array
     */
    private static $filesUploaded = [];

    /**
     * Contains any errors for a given upload field
     *
     * @var array
     */
    private static $filesUploadedErrors = [];

    /**
     * @return string
     */
    public static function getFieldType(): string
    {
        return self::TYPE_FILE;
    }

    /**
     * Return the field TYPE
     *
     * @return string
     */
    public function getType(): string
    {
        return self::TYPE_FILE;
    }

    /**
     * @return array
     */
    public function getFileKinds(): array
    {
        return $this->fileKinds;
    }

    /**
     * @return int
     */
    public function getMaxFileSizeKB(): int
    {
        return $this->maxFileSizeKB ?: self::DEFAULT_MAX_FILESIZE_KB;
    }

    /**
     * @return string
     */
    public function getInputHtml(): string
    {
        $attributes = $this->getCustomAttributes();

        return '<input '
            . $this->getAttributeString('name', $this->getHandle())
            . $this->getAttributeString('type', $this->getType())
            . $this->getAttributeString('id', $this->getIdAttribute())
            . $this->getAttributeString('class', $attributes->getClass())
            . $this->getRequiredAttribute()
            . $attributes->getInputAttributesAsString()
            . '/>';
    }

    /**
     * Validate the field and add error messages if any
     *
     * @return array
     */
    protected function validate(): array
    {
        $uploadErrors = [];

        if (!array_key_exists($this->handle, self::$filesUploaded)) {
            if (isset($_FILES[$this->handle]) && !empty($_FILES[$this->handle]['name'])) {
                $extension       = pathinfo($_FILES[$this->handle]['name'], PATHINFO_EXTENSION);
                $validExtensions = $this->getValidExtensions();

                if (empty($_FILES[$this->handle]['tmp_name'])) {
                    $errorCode = $_FILES[$this->handle]['error'];

                    switch ($errorCode) {
                        case UPLOAD_ERR_INI_SIZE:
                        case UPLOAD_ERR_FORM_SIZE:
                            $uploadErrors[] = $this->translate('File size too large');
                            break;

                        case UPLOAD_ERR_PARTIAL:
                            $uploadErrors[] = $this->translate('The file was only partially uploaded');
                            break;
                    }
                    $uploadErrors[] = $this->translate('Could not upload file');
                }

                // Check for the correct file extension
                if (!in_array(strtolower($extension), $validExtensions, true)) {
                    $uploadErrors[] = $this->translate(
                        "'{extension}' is not an allowed file extension",
                        ['extension' => $extension]
                    );
                }

                $fileSizeKB = ceil($_FILES[$this->handle]['size'] / 1024);
                if ($fileSizeKB > $this->getMaxFileSizeKB()) {
                    $uploadErrors[] = $this->translate(
                        'You tried uploading {fileSize}KB, but the maximum file upload size is {maxFileSize}KB',
                        ['fileSize' => $fileSizeKB, 'maxFileSize' => $this->getMaxFileSizeKB()]
                    );
                }
            } else if ($this->isRequired()) {
                $uploadErrors[] = $this->translate('This field is required');
            }

            // if there are errors - prevent the file from being uploaded
            if ($uploadErrors) {
                self::$filesUploaded[$this->handle] = null;
            }

            self::$filesUploadedErrors[$this->handle] = $uploadErrors;
        }

        return self::$filesUploadedErrors[$this->handle];
    }

    /**
     * Attempt to upload the file to its respective location
     *
     * @return int|null - asset ID
     * @throws FileUploadException
     */
    public function uploadFile()
    {
        if (!array_key_exists($this->handle, self::$filesUploaded)) {
            $response = $this->getForm()->getFileUploadHandler()->uploadFile($this);

            self::$filesUploaded[$this->handle] = null;
            self::$filesUploadedErrors[$this->handle] = [];

            if ($response) {
                $errors = $this->getErrors() ?: [];

                if ($response->getAssetId()) {
                    $this->value = $response->getAssetId();
                    self::$filesUploaded[$this->handle] = $response->getAssetId();

                    return $this->value;
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
     * Returns an array of all valid file extensions for this field
     *
     * @return array
     */
    private function getValidExtensions(): array
    {
        $allFileKinds = $this->getForm()->getFileUploadHandler()->getFileKinds();

        $selectedFileKinds = $this->getFileKinds();

        $allowedExtensions = [];
        if ($selectedFileKinds) {
            foreach ($selectedFileKinds as $kind) {
                if (array_key_exists($kind, $allFileKinds)) {
                    $allowedExtensions = array_merge($allowedExtensions, $allFileKinds[$kind]);
                }
            }
        } else {
            foreach ($allFileKinds as $kind => $extensions) {
                $allowedExtensions = array_merge($allowedExtensions, $extensions);
            }
        }

        return $allowedExtensions;
    }
}
