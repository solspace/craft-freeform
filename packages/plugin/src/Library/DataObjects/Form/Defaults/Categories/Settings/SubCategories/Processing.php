<?php

namespace Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\Settings\SubCategories;

use Solspace\Freeform\Attributes\Defaults\Label;
use Solspace\Freeform\Attributes\Defaults\OptionsGenerator;
use Solspace\Freeform\Attributes\Defaults\SetDefaultValue;
use Solspace\Freeform\Form\Settings\Implementations\Options\ProcessingDisplayOptions;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\BaseCategory;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\BoolItem;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\SelectItem;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\TextItem;

class Processing extends BaseCategory
{
    #[Label('Use AJAX')]
    #[SetDefaultValue(true)]
    public BoolItem $ajax;

    #[Label('Processing Display')]
    #[OptionsGenerator(ProcessingDisplayOptions::class)]
    #[SetDefaultValue('button')]
    public SelectItem $processingDisplay;

    #[SetDefaultValue('Processing...')]
    public TextItem $processingText;

    public function getLabel(): string
    {
        return 'Processing';
    }
}
