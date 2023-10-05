<?php

namespace Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\Settings\SubCategories;

use Solspace\Freeform\Attributes\Defaults\OptionsGenerator;
use Solspace\Freeform\Attributes\Defaults\SetDefaultValue;
use Solspace\Freeform\Bundles\Form\Limiting\FormLimiting;
use Solspace\Freeform\Form\Settings\Implementations\Options\FormLimitingOptions;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\BaseCategory;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\SelectItem;

class Limits extends BaseCategory
{
    #[OptionsGenerator(FormLimitingOptions::class)]
    #[SetDefaultValue(FormLimiting::NO_LIMIT)]
    public SelectItem $duplicateCheck;

    public function getLabel(): string
    {
        return 'Limits';
    }
}
