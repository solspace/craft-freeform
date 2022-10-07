<?php

namespace Solspace\Freeform\Fields\Pro;

use craft\helpers\UrlHelper;
use Solspace\Freeform\Attributes\Field\EditableProperty;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Fields\FileUploadField;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\PlaceholderInterface;
use Solspace\Freeform\Library\Helpers\FileHelper;

#[Type(
    name: 'File Drag & Drop',
    typeShorthand: 'file-drag-and-drop',
    iconPath: __DIR__.'/../Icons/text.svg',
)]
class FileDragAndDropField extends FileUploadField implements ExtraFieldInterface, PlaceholderInterface
{
    public const DEFAULT_ACCENT = '#3a85ee';
    public const DEFAULT_THEME = 'light';
    public const DEFAULT_PLACEHOLDER = 'Drag and drop files here or click to upload';

    #[EditableProperty(
        type: 'color',
        label: 'Accent Color',
        instructions: 'Select accent color',
    )]
    protected string $accent = self::DEFAULT_ACCENT;

    #[EditableProperty(
        type: 'select',
        label: 'Accent Color',
        instructions: 'Select accent color',
        options: [
            'light' => 'Light',
            'dark' => 'Dark',
        ],
    )]
    protected string $theme = self::DEFAULT_THEME;

    #[EditableProperty(
        label: 'Placeholder',
        instructions: 'Field placeholder.',
    )]
    protected string $placeholder = self::DEFAULT_PLACEHOLDER;

    public function getAccent(): string
    {
        return $this->accent;
    }

    public function getTheme(): string
    {
        return $this->theme;
    }

    public function getPlaceholder(): string
    {
        return $this->placeholder;
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
        $this->addInputAttribute('class', 'freeform-file-drag-and-drop '.$attributes->getClass());

        $messageFiles = $this->translate(
            'Maximum file upload limit of {limit} reached',
            ['limit' => $this->getFileCount()]
        );
        $messageSize = $this->translate(
            'Maximum file upload size is {maxFileSize}KB',
            ['maxFileSize' => $this->getMaxFileSizeKB()]
        );

        $output = '';
        $output .= '<div data-freeform-file-upload="'.$this->getHandle().'" ';
        $output .= 'data-error-append-target="'.$this->getHandle().'" ';
        $output .= 'data-file-count="'.\count($this->getValue()).'" ';
        $output .= 'data-max-files="'.$this->getFileCount().'" ';
        $output .= 'data-max-size="'.$this->getMaxFileSizeBytes().'" ';
        $output .= 'data-theme="'.$this->getTheme().'" ';
        $output .= 'data-message-progress="'.$this->translate('Upload in progress...').'" ';
        $output .= 'data-message-complete="'.$this->translate('Upload complete!').'" ';
        $output .= 'data-message-files="'.$messageFiles.'" ';
        $output .= 'data-message-size="'.$messageSize.'" ';
        $output .= 'data-accent="'.$this->getAccent().'" ';
        $output .= 'data-base-url="'.UrlHelper::siteUrl('/freeform').'" ';
        $output .= $this->getInputAttributesString();
        $output .= '>';
        $output .= '<div data-placeholder class="freeform-file-drag-and-drop__placeholder">';
        $output .= $this->translate($this->getPlaceholder());
        $output .= '</div>';
        $output .= '<div data-preview-zone class="freeform-file-drag-and-drop__preview-zone"></div>';
        $output .= '<ul data-messages class="freeform-file-drag-and-drop__messages"></ul>';
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
            if ($this->isRequired() && !$this->isHidden() && empty($this->getValue())) {
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
