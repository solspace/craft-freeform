<?php

namespace Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\Settings\SubCategories;

use Solspace\Freeform\Attributes\Defaults\Label;
use Solspace\Freeform\Attributes\Defaults\SetDefaultValue;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\BaseCategory;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\BoolItem;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\TextItem;

class Processing extends BaseCategory
{
    #[Label('Use AJAX')]
    #[SetDefaultValue(true)]
    public BoolItem $ajax;

    #[Label('Show Processing Indicator on Submit')]
    #[SetDefaultValue(true)]
    public BoolItem $showIndicator;

    #[Label('Show Processing Text on Submit')]
    #[SetDefaultValue(true)]
    public BoolItem $showText;

    #[SetDefaultValue('Processing...')]
    public TextItem $processingText;

    public function getLabel(): string
    {
        return 'Processing';
    }
}
