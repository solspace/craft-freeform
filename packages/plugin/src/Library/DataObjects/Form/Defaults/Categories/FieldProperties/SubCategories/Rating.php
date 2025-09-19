<?php

namespace Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\FieldProperties\SubCategories;

use Solspace\Freeform\Attributes\Defaults\Label;
use Solspace\Freeform\Attributes\Defaults\OptionsGenerator;
use Solspace\Freeform\Attributes\Defaults\SetDefaultValue;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\BaseCategory;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\BoolItem;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\ColorItem;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\SelectItem;

class Rating extends BaseCategory
{
    #[Label('Use built-in javascript?')]
    #[SetDefaultValue(true)]
    public BoolItem $javascript;

    #[Label('Maximum number of stars')]
    #[SetDefaultValue(5)]
    #[OptionsGenerator([
        1 => 1,
        2 => 2,
        3 => 3,
        4 => 4,
        5 => 5,
        6 => 6,
        7 => 7,
        8 => 8,
        9 => 9,
        10 => 10,
    ])]
    public SelectItem $max;

    #[Label('Unselected Color')]
    #[SetDefaultValue('#DDDDDD')]
    public ColorItem $idle;

    #[Label('Hover Color')]
    #[SetDefaultValue('#FFD700')]
    public ColorItem $hover;

    #[Label('Selected Color')]
    #[SetDefaultValue('#FF7700')]
    public ColorItem $selected;

    public function getLabel(): string
    {
        return 'Rating';
    }
}
