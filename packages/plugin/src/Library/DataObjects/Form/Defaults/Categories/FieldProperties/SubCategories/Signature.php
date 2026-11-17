<?php

namespace Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\FieldProperties\SubCategories;

use Solspace\Freeform\Attributes\Defaults\Label;
use Solspace\Freeform\Attributes\Defaults\SetDefaultValue;
use Solspace\Freeform\Attributes\Defaults\Unit;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\BaseCategory;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\BoolItem;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\ColorItem;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\TextItem;

class Signature extends BaseCategory
{
    #[Label('Allow Typed Signatures')]
    #[SetDefaultValue(false)]
    public BoolItem $allowTyped;

    #[Label('Width of Pad')]
    #[SetDefaultValue('400')]
    #[Unit('px')]
    public TextItem $width;

    #[Label('Height of Pad')]
    #[SetDefaultValue('100')]
    #[Unit('px')]
    public TextItem $height;

    #[Label('Border Color of Pad')]
    #[SetDefaultValue('#999999')]
    public ColorItem $borderColor;

    #[Label('Background Color of Pad')]
    #[SetDefaultValue('TRANSPARENT')]
    public ColorItem $backgroundColor;

    #[Label('Pen Color')]
    #[SetDefaultValue('#000000')]
    public ColorItem $penColor;

    #[Label('Pen Dot Size')]
    #[SetDefaultValue('2.5')]
    #[Unit('px')]
    public TextItem $penDotSize;

    public function getLabel(): string
    {
        return 'Signature';
    }
}
