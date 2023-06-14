<?php

namespace Solspace\Freeform\Fields\Implementations\Pro;

use craft\helpers\UrlHelper;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Fields\Implementations\FileUploadField;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Fields\Interfaces\PlaceholderInterface;
use Solspace\Freeform\Library\Helpers\FileHelper;

#[Type(
    name: 'File Drag & Drop',
    typeShorthand: 'file-drag-and-drop',
    iconPath: __DIR__.'/../Icons/text.svg',
    previewTemplatePath: __DIR__.'/../PreviewTemplates/file-drag-n-drop.ejs',
)]
class FileDragAndDropField extends FileUploadField implements ExtraFieldInterface, PlaceholderInterface
{
    public const DEFAULT_ACCENT = '#3a85ee';
    public const DEFAULT_THEME = 'light';
    public const DEFAULT_PLACEHOLDER = 'Drag and drop files here or click to upload';

    #[Input\ColorPicker(
        label: 'Accent Color',
        instructions: 'Select accent color',
    )]
    protected string $accent = self::DEFAULT_ACCENT;

    #[Input\Select(
        label: 'Accent Color',
        instructions: 'Select accent color',
        options: [
            'light' => 'Light',
            'dark' => 'Dark',
        ],
    )]
    protected string $theme = self::DEFAULT_THEME;

    #[Input\Text(
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

    public function getType(): string
    {
        return self::TYPE_FILE_DRAG_AND_DROP;
    }

    public function getInputHtml(): string
    {
        $messageFiles = $this->translate(
            'Maximum file upload limit of {limit} reached',
            ['limit' => $this->getFileCount()]
        );
        $messageSize = $this->translate(
            'Maximum file upload size is {maxFileSize}KB',
            ['maxFileSize' => $this->getMaxFileSizeKB()]
        );

        $attributes = $this->attributes->getInput()
            ->clone()
            ->append('class', 'freeform-file-drag-and-drop__input')
            ->replace('div-freeform-file-upload', $this->getHandle())
            ->setIfEmpty('data-error-append-target', $this->getHandle())
            ->replace('data-file-count', \count($this->getValue()))
            ->replace('data-max-files', $this->getFileCount())
            ->replace('data-max-size', $this->getMaxFileSizeBytes())
            ->setIfEmpty('data-theme', $this->getTheme())
            ->setIfEmpty('data-message-progress', $this->translate('Upload in progress...'))
            ->setIfEmpty('data-message-complete', $this->translate('Upload complete!'))
            ->setIfEmpty('data-message-files', $messageFiles)
            ->setIfEmpty('data-message-size', $messageSize)
            ->setIfEmpty('data-accent', $this->getAccent())
            ->setIfEmpty('data-base-url', UrlHelper::siteUrl('/freeform'))
        ;

        $output = '';
        $output .= '<div'.$attributes.'>';
        $output .= '<div data-placeholder class="freeform-file-drag-and-drop__placeholder">';
        $output .= $this->translate($this->getPlaceholder());
        $output .= '</div>';
        $output .= '<div data-preview-zone class="freeform-file-drag-and-drop__preview-zone"></div>';
        $output .= '<ul data-messages class="freeform-file-drag-and-drop__messages"></ul>';
        $output .= '<input type="file" multiple />';
        $output .= '</div>';

        return $output;
    }

    public function uploadFile(): ?array
    {
        return null;
    }

    public function includeInGqlSchema(): bool
    {
        return false;
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
