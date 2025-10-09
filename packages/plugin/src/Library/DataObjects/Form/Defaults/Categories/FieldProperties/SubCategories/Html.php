<?php

namespace Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\FieldProperties\SubCategories;

use Solspace\Freeform\Attributes\Defaults\Label;
use Solspace\Freeform\Attributes\Defaults\SetDefaultValue;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\BaseCategory;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\BoolItem;

class Html extends BaseCategory
{
    #[Label('Allow Twig')]
    #[SetDefaultValue(false)]
    public BoolItem $twig;

    public function getLabel(): string
    {
        return 'HTML';
    }
}
