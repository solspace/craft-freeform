<?php

namespace Solspace\Freeform\Fields\Pro;

use Solspace\Freeform\Fields\FileUploadField;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Library\Helpers\FileHelper;

class FileDragAndDropField extends FileUploadField implements ExtraFieldInterface
{
    const DEFAULT_ACCENT = '#3a85ee';
    const DEFAULT_THEME = 'light';

    /** @var string */
    protected $accent;

    /** @var string */
    protected $theme;

    public function getAccent()
    {
        return $this->accent;
    }

    public function getTheme()
    {
        return $this->theme;
    }

    public static function getFieldTypeName(): string
    {
        return 'File Drag & Drop';
    }

    public static function getFieldType(): string
    {
        return self::TYPE_FILE_DRAG_AND_DROP;
    }

    public function getType(): string
    {
        return self::TYPE_FILE_DRAG_AND_DROP;
    }

    public function getInputHtml(): string
    {
        $attributes = $this->getCustomAttributes();
        $this->addInputAttribute('class', 'freeform-file-upload '.$attributes->getClass());

        $output = '';
        $output .= '<div data-freeform-file-upload="'.$this->getHandle().'" ';
        $output .= 'data-file-count="'.\count($this->getValue()).'" ';
        $output .= 'data-theme="'.$this->getTheme().'" ';
        $output .= 'style="border-color: '.$this->getAccent().';" ';
        $output .= $this->getInputAttributesString();
        $output .= '>';
        $output .= '<div data-placeholder>';
        $output .= '<strong>Choose a file</strong>';
        $output .= '<span> or drag it here</span>';
        $output .= '</div>';
        $output .= '<div data-preview-zone></div>';
        $output .= '<div data-global-loading></div>';
        $output .= '<div data-messages></div>';
        $output .= '<input type="file" multiple />';
        $output .= '</div>';

        return $output;
    }

    public function uploadFile()
    {
    }

    protected function validate(): array
    {
        $errors = [];
        $handle = $this->getHandle();
        $isUploaded = isset($_FILES[$handle]) && !empty($_FILES[$handle]['name']) && !$this->isHidden();

        $file = $_FILES[$handle] ?? null;
        if (!$file) {
            if ($this->isRequired()) {
                return [$this->translate('This field is required')];
            }

            return [];
        }

        $name = $file['name'];
        $tmpName = $file['tmp_name'];
        $size = $file['size'];
        $errorCode = $file['error'];

        if (\is_array($name)) {
            $errors[] = $this->translate('Multiple field uploads not supported');
        }

        if ($this->isRequired() && !$isUploaded) {
            $errors[] = $this->translate('This field is required');
        }

        $extension = pathinfo($name, \PATHINFO_EXTENSION);
        $validExtensions = $this->getValidExtensions();

        if (empty($tmpName) && \UPLOAD_ERR_NO_FILE === $errorCode) {
            return $errors;
        }

        // Check the mime type if the server supports it
        if (FileHelper::isMimeTypeCheckEnabled() && !empty($tmpName)) {
            $mimeType = FileHelper::getMimeType($tmpName);
            $mimeExtension = FileHelper::getExtensionByMimeType($mimeType);

            if ($mimeExtension) {
                $extension = $mimeExtension;
            } else {
                $errors[] = $this->translate('Unknown file type');
            }
        }

        if (empty($tmpName)) {
            switch ($errorCode) {
                case \UPLOAD_ERR_INI_SIZE:
                case \UPLOAD_ERR_FORM_SIZE:
                    $errors[] = $this->translate('File size too large');

                    break;

                case \UPLOAD_ERR_PARTIAL:
                    $errors[] = $this->translate('The file was only partially uploaded');

                    break;
            }
            $errors[] = $this->translate('Could not upload file');
        }

        // Check for the correct file extension
        if (!\in_array(strtolower($extension), $validExtensions, true)) {
            $errors[] = $this->translate(
                "'{extension}' is not an allowed file extension",
                ['extension' => $extension]
            );
        }

        $fileSizeKB = ceil($size / 1024);
        if ($fileSizeKB > $this->getMaxFileSizeKB()) {
            $errors[] = $this->translate(
                'You tried uploading {fileSize}KB, but the maximum file upload size is {maxFileSize}KB',
                ['fileSize' => $fileSizeKB, 'maxFileSize' => $this->getMaxFileSizeKB()]
            );
        }

        return $errors;
    }
}
