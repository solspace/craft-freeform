<?php

namespace Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\FieldProperties\SubCategories;

use Solspace\Freeform\Attributes\Defaults\Label;
use Solspace\Freeform\Attributes\Defaults\OptionsGenerator;
use Solspace\Freeform\Attributes\Defaults\SetDefaultValue;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\BaseCategory;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\BoolItem;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\SelectItem;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\TextItem;

class Table extends BaseCategory
{
    #[Label('Use built-in javascript for adding and removing rows')]
    #[SetDefaultValue(true)]
    public BoolItem $javascript;

    #[Label('Limit Rows')]
    #[SetDefaultValue('')]
    #[OptionsGenerator([
        '' => 'Do not limit',
        'min' => 'A minimum of…',
        'max' => 'A maximum of…',
        'range' => 'A range of…',
        'exact' => 'Exactly…',
    ])]
    public SelectItem $limitRows;

    #[Label('Minimum number of rows')]
    public TextItem $minRows;

    #[Label('Maximum number of rows')]
    public TextItem $maxRows;

    #[Label('Exact number of rows')]
    public TextItem $exactRows;

    #[Label('Add Button Label')]
    #[SetDefaultValue('Add')]
    public TextItem $addButtonLabel;

    #[Label('Add Button Markup')]
    public TextItem $addButtonMarkup;

    #[Label('Remove Button Label')]
    #[SetDefaultValue('Remove')]
    public TextItem $removeButtonLabel;

    #[Label('Add Button Markup')]
    public TextItem $removeButtonMarkup;

    #[Label('Table Attributes')]
    #[SetDefaultValue(true)]
    public BoolItem $tableAttributes;

    public function getLabel(): string
    {
        return 'Table';
    }
}
