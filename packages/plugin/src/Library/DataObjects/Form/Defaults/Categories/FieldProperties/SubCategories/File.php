<?php

namespace Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\FieldProperties\SubCategories;

use Solspace\Freeform\Attributes\Defaults\EmptyValue;
use Solspace\Freeform\Attributes\Defaults\Label;
use Solspace\Freeform\Attributes\Defaults\OptionsGenerator;
use Solspace\Freeform\Attributes\Defaults\SetDefaultValue;
use Solspace\Freeform\Attributes\Defaults\SetPlaceholder;
use Solspace\Freeform\Attributes\Property\Implementations\Files\FileKindsOptionsGenerator;
use Solspace\Freeform\Fields\Implementations\Options\AssetSourceOptions;
use Solspace\Freeform\Fields\Implementations\Pro\FileDragAndDropField;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\BaseCategory;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\BoolItem;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\CheckboxesItem;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\ColorItem;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\SelectItem;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\TextItem;

class File extends BaseCategory
{
    #[Label('File Count')]
    #[SetDefaultValue(1)]
    public TextItem $count;

    #[Label('Asset Source')]
    #[EmptyValue('')]
    #[OptionsGenerator(AssetSourceOptions::class)]
    #[SetDefaultValue('')]
    public SelectItem $initialValue;

    #[Label('Upload Location')]
    public TextItem $uploadLocation;

    #[Label('File Kinds')]
    #[SetDefaultValue(['image'])]
    #[OptionsGenerator(FileKindsOptionsGenerator::class)]
    public CheckboxesItem $fileKinds;

    #[Label('Maximum File Size (KB)')]
    #[SetDefaultValue('2048')]
    public TextItem $maxFileSizeKB;

    #[Label('Accent Color')]
    #[SetDefaultValue(FileDragAndDropField::DEFAULT_ACCENT)]
    public ColorItem $accentColor;

    #[Label('Theme')]
    #[SetDefaultValue(FileDragAndDropField::DEFAULT_THEME)]
    #[OptionsGenerator([
        'light' => 'Light',
        'dark' => 'Dark',
    ])]
    public SelectItem $theme;

    #[Label('Placeholder')]
    #[SetPlaceholder(FileDragAndDropField::DEFAULT_PLACEHOLDER)]
    public TextItem $placeholder;

    #[Label('Remove File Confirmation Message')]
    #[SetPlaceholder('Are you sure?')]
    public TextItem $removeFileMessage;

    #[Label('Use Dialog Element')]
    #[SetDefaultValue(false)]
    public BoolItem $dialogElement;

    #[Label('Custom Confirm Dialog Selector')]
    #[SetPlaceholder('#my-confirm-dialog')]
    public TextItem $dialogSelector;

    public function getLabel(): string
    {
        return 'File';
    }
}
