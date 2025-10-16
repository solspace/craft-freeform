<?php

namespace Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\FieldProperties\SubCategories;

use Solspace\Freeform\Attributes\Defaults\EmptyValue;
use Solspace\Freeform\Attributes\Defaults\Label;
use Solspace\Freeform\Attributes\Defaults\OptionsGenerator;
use Solspace\Freeform\Attributes\Defaults\SetDefaultValue;
use Solspace\Freeform\Bundles\Fields\Implementations\CardsField\ImageTransformOptionsGenerator;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\BaseCategory;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\SelectItem;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\TextItem;

class Image extends BaseCategory
{
    #[Label('Image Transform')]
    #[EmptyValue('')]
    #[SetDefaultValue('')]
    #[OptionsGenerator(ImageTransformOptionsGenerator::class)]
    public SelectItem $transform;

    #[Label('Srcset')]
    #[SetDefaultValue('')]
    public TextItem $srcset;

    public function getLabel(): string
    {
        return 'Image';
    }
}
