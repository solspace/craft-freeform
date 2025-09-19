<?php

namespace Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\FieldProperties\SubCategories;

use Solspace\Freeform\Attributes\Defaults\Label;
use Solspace\Freeform\Attributes\Defaults\SetDefaultValue;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\BaseCategory;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\BoolItem;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\ColorItem;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\TextItem;

class Signature extends BaseCategory
{
    #[Label('Width')]
    #[SetDefaultValue('400')]
    public TextItem $width;

    #[Label('Height')]
    #[SetDefaultValue('100')]
    public TextItem $height;

    #[Label('Show \'Clear\' button?')]
    #[SetDefaultValue(true)]
    public BoolItem $clear;

    #[Label('Border color of Pad')]
    #[SetDefaultValue('#999999')]
    public ColorItem $borderColor;

    #[Label('Background color of pad')]
    #[SetDefaultValue('TRANSPARENT')]
    public ColorItem $backgroundColor;

    #[Label('Pen color')]
    #[SetDefaultValue('#000000')]
    public ColorItem $penColor;

    public function getLabel(): string
    {
        return 'Signature';
    }
}
