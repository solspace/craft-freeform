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
use GraphQL\Type\Definition\Type as GQLType;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Implementations\Files\FileKindsOptionsGenerator;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Bundles\GraphQL\Types\FileUploadType;
use Solspace\Freeform\Bundles\GraphQL\Types\Inputs\FileUploadInputType;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\Interfaces\FileUploadInterface;
use Solspace\Freeform\Fields\Interfaces\MultiValueInterface;
use Solspace\Freeform\Fields\Traits\FileUploadTrait;
use Solspace\Freeform\Fields\Traits\MultipleValueTrait;

#[Type(
    name: 'File Upload',
    typeShorthand: 'file',
    iconPath: __DIR__.'/Icons/text.svg',
    previewTemplatePath: __DIR__.'/PreviewTemplates/file-upload.ejs',
)]
class FileUploadField extends AbstractField implements MultiValueInterface, FileUploadInterface
{
    use FileUploadTrait;
    use MultipleValueTrait;

    public const DEFAULT_MAX_FILESIZE_KB = 2048;
    public const DEFAULT_FILE_COUNT = 1;

    #[Input\Checkboxes(
        label: 'File Kinds',
        instructions: 'Select the file kinds that are allowed to be uploaded.',
        selectAll: true,
        columns: 2,
        options: FileKindsOptionsGenerator::class,
    )]
    protected array $fileKinds = ['image', 'document'];

    #[Input\Integer(
        label: 'Maximum File Size',
        instructions: 'Specify the maximum file size, in KB.',
    )]
    protected int $maxFileSizeKB = 2048;

    #[Input\Integer(
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

    public function getContentGqlType(): array|GQLType
    {
        return GQLType::listOf(FileUploadType::getType());
    }

    public function getContentGqlMutationArgumentType(): GQLType|array
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
            'name' => $this->getHandle(),
            'type' => FileUploadInputType::getType(),
            'description' => trim($description),
        ];
    }
}
