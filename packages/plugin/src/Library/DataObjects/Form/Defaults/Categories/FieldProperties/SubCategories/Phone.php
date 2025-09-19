<?php

namespace Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\FieldProperties\SubCategories;

use Solspace\Freeform\Attributes\Defaults\Label;
use Solspace\Freeform\Attributes\Defaults\SetDefaultValue;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\BaseCategory;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\BoolItem;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\TextItem;

class Phone extends BaseCategory
{
    #[Label('Pattern validation')]
    public TextItem $pattern;

    #[Label('Use built-in javascript validation on pattern')]
    #[SetDefaultValue(false)]
    public BoolItem $javascript;

    public function getLabel(): string
    {
        return 'Phone';
    }
}
