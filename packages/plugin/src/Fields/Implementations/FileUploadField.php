<?php

/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2026, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Fields\Implementations;

use craft\elements\Asset;
use craft\elements\db\AssetQuery;
use craft\gql\interfaces\elements\Asset as FileUploadType;
use craft\helpers\Assets;
use craft\helpers\Html;
use GraphQL\Type\Definition\Type as GQLType;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\DefaultValue;
use Solspace\Freeform\Attributes\Property\Implementations\Files\FileKindsOptionsGenerator;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Limitation;
use Solspace\Freeform\Bundles\GraphQL\Types\Inputs\FileUploadInputType;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Interfaces\EncryptionInterface;
use Solspace\Freeform\Fields\Interfaces\FileUploadInterface;
use Solspace\Freeform\Fields\Interfaces\MultiValueInterface;
use Solspace\Freeform\Fields\Interfaces\NoEmailPresenceInterface;
use Solspace\Freeform\Fields\Interfaces\SkipGibberishCheckInterface;
use Solspace\Freeform\Fields\Traits\EncryptionTrait;
use Solspace\Freeform\Fields\Traits\FileUploadTrait;
use Solspace\Freeform\Freeform;
use Twig\Markup;

#[Type(
    name: 'File Upload',
    typeShorthand: 'file',
    iconPath: __DIR__.'/Icons/file-upload.svg',
    previewTemplatePath: __DIR__.'/PreviewTemplates/file-upload.ejs',
)]
class FileUploadField extends AbstractField implements MultiValueInterface, FileUploadInterface, EncryptionInterface, NoEmailPresenceInterface, SkipGibberishCheckInterface
{
    use EncryptionTrait;
    use FileUploadTrait;

    public const DEFAULT_MAX_FILESIZE_KB = 2048;
    public const DEFAULT_FILE_COUNT = 1;

    #[Limitation('props.file', 'fileKinds')]
    #[DefaultValue('props.file.fileKinds')]
    #[Input\Checkboxes(
        label: 'File Kinds',
        instructions: 'Select the file kinds that are allowed to be uploaded.',
        order: 3,
        selectAll: true,
        columns: 2,
        options: FileKindsOptionsGenerator::class,
    )]
    protected array $fileKinds = ['image'];

    #[Limitation('props.file', 'maxFileSizeKB')]
    #[DefaultValue('props.file.maxFileSizeKB')]
    #[Input\Integer(
        label: 'Maximum File Size',
        instructions: 'Specify the maximum file size, in KB.',
        order: 4,
    )]
    protected int $maxFileSizeKB = self::DEFAULT_MAX_FILESIZE_KB;

    #[Limitation('props.file', 'count')]
    #[DefaultValue('props.file.count')]
    #[Input\Integer(
        label: 'Max Files',
        instructions: 'Specify the maximum uploadable file count.',
    )]
    protected int $fileCount = self::DEFAULT_FILE_COUNT;

    #[Limitation('props.file', 'showUploadRequirements')]
    #[DefaultValue('props.file.showUploadRequirements')]
    #[Input\Boolean(
        label: 'Show Upload Requirements',
        instructions: 'Display the allowed file kinds, maximum number of files, and maximum size beneath the upload field.',
        order: 5,
    )]
    protected bool $showUploadRequirements = false;

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

    public function setValue(mixed $value): FieldInterface
    {
        if ($value instanceof Asset) {
            $value = $value->id;
        }

        if (!\is_array($value)) {
            if (null === $value) {
                $value = [];
            } else {
                $value = [$value];
            }
        }

        $this->value = $value;

        return $this;
    }

    public function getAssets(): AssetQuery
    {
        $query = Asset::find();

        if ($this->getValue()) {
            $query->id($this->getValue());
        } else {
            $query->id(-99999)->limit(0);
        }

        return $query;
    }

    public function getFileKinds(): array
    {
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
        return $this->fileCount <= 1 ? self::DEFAULT_FILE_COUNT : $this->fileCount;
    }

    public function isShowUploadRequirements(): bool
    {
        return $this->showUploadRequirements;
    }

    public function getUploadRequirementsText(): string
    {
        if (!$this->isShowUploadRequirements()) {
            return '';
        }

        $allowedKinds = Assets::getAllowedFileKinds();
        $friendlyKinds = [
            'image' => Freeform::t('Images'),
            'pdf' => Freeform::t('PDFs'),
            'audio' => Freeform::t('Audio files'),
            'video' => Freeform::t('Videos'),
        ];
        $kinds = [];
        foreach ($this->getFileKinds() as $kind) {
            if (isset($allowedKinds[$kind])) {
                $kinds[] = $friendlyKinds[$kind] ?? \Craft::t('app', $allowedKinds[$kind]['label']);
            }
        }

        $requirements = [];
        if ($kinds) {
            $requirements[] = implode(', ', $kinds);
        }

        $count = $this->getFileCount();
        $requirements[] = 1 === $count
            ? Freeform::t('1 file')
            : Freeform::t('Up to {count} files', ['count' => $count]);
        $requirements[] = Freeform::t('Up to {size} KB per file', [
            'size' => \Craft::$app->getFormatter()->asInteger($this->getMaxFileSizeKB()),
        ]);

        return implode(' · ', $requirements);
    }

    public function renderUploadRequirements(): Markup
    {
        return $this->renderRaw($this->getUploadRequirementsHtml());
    }

    public function getInputHtml(): string
    {
        $preview = '';

        $assets = $this->getAssets()->all();
        if (!empty($assets)) {
            $items = '';

            foreach ($assets as $asset) {
                if ($asset->kind === 'image') {
                    $items .= Html::tag('img', '', [
                        'src' => $asset->getUrl([
                            'width' => 150,
                            'height' => 150,
                            'mode' => 'crop',
                        ]),
                        'alt' => Html::encode($asset->filename),
                    ]);
                } else {
                    $items .= Html::tag('span', Html::encode($asset->filename));
                }
            }

            $preview = Html::tag('div', $items, [
                'class' => 'form-input-asset-files',
            ]);
        }

        $attributes = $this->getAttributes()
            ->getInput()
            ->clone()
            ->setIfEmpty('name', $this->getHandle().'[]')
            ->setIfEmpty('type', $this->getType())
            ->setIfEmpty('id', $this->getIdAttribute())
            ->set('multiple', $this->getFileCount() > 1)
            ->set($this->getRequiredAttribute())
        ;

        if ($this->isShowUploadRequirements()) {
            $attributes->append('aria-describedby', $this->getIdAttribute().'-upload-requirements');
        }

        $input = Html::tag(
            $attributes->getTag('input'),
            '',
            $attributes->toHtmlTagArray(['field' => $this])
        );

        return $preview.$input.($this->parameters->uploadRequirementsInInput === false ? '' : $this->getUploadRequirementsHtml());
    }

    public function getContentGqlType(): array|GQLType
    {
        return GQLType::listOf(FileUploadType::getType());
    }

    public function getContentGqlMutationArgumentType(): array|GQLType
    {
        $description = $this->getContentGqlDescription();

        if (1 === $this->getFileCount()) {
            $description[] = 'Only 1 file can be uploaded at once.';
        } else {
            $description[] = 'Multiple files can be uploaded at once.';
        }

        $description[] = 'File types include '.implode(', ', $this->getFileKinds()).'.';
        $description[] = 'Max file size is '.$this->getMaxFileSizeKB().'KB.';

        $description = implode("\n", $description);

        return [
            'name' => $this->getContentGqlHandle(),
            'type' => FileUploadInputType::getType(),
            'description' => trim($description),
        ];
    }

    protected function getUploadRequirementsHtml(): string
    {
        if (!$this->isShowUploadRequirements()) {
            return '';
        }

        $instructionClass = $this->getAttributes()->getInstructions()->get('class', '');

        return Html::tag('div', Html::encode($this->getUploadRequirementsText()), [
            'id' => $this->getIdAttribute().'-upload-requirements',
            'class' => trim('freeform-upload-requirements '.$instructionClass),
            'style' => 'margin-top: 0.375em; margin-bottom: 0; font-size: 0.875em; line-height: 1.4;',
        ]);
    }
}
