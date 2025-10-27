<?php

namespace Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\FieldProperties\SubCategories;

use Solspace\Freeform\Attributes\Defaults\Label;
use Solspace\Freeform\Attributes\Defaults\OptionsGenerator;
use Solspace\Freeform\Attributes\Defaults\SetDefaultValue;
use Solspace\Freeform\Fields\Implementations\Pro\CalculationField;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\BaseCategory;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\SelectItem;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\TextItem;

class Calculation extends BaseCategory
{
    #[Label('Decimal Count')]
    public TextItem $decimalCount;

    #[Label('Input Type')]
    #[SetDefaultValue(CalculationField::INPUT_TYPE_REGULAR)]
    #[OptionsGenerator([
        CalculationField::INPUT_TYPE_REGULAR => 'Regular Text Input',
        CalculationField::INPUT_TYPE_PLAIN => 'Plain Text',
        CalculationField::INPUT_TYPE_HIDDEN => 'Hidden',
    ])]
    public SelectItem $inputType;

    public function getLabel(): string
    {
        return 'Calculation';
    }
}
