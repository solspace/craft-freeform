<?php

namespace Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\Settings\SubCategories;

use Solspace\Freeform\Attributes\Defaults\Label;
use Solspace\Freeform\Attributes\Defaults\OptionsGenerator;
use Solspace\Freeform\Attributes\Defaults\SetDefaultValue;
use Solspace\Freeform\Attributes\Property\ValueGenerator;
use Solspace\Freeform\Form\Settings\Implementations\Options\FormStatusOptions;
use Solspace\Freeform\Form\Settings\Implementations\ValueGenerators\DefaultStatusGenerator;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\BaseCategory;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\BoolItem;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\SelectItem;

class DataStorage extends BaseCategory
{
    #[Label('Store Submitted Data for this Form')]
    #[SetDefaultValue(true)]
    public BoolItem $storeData;

    #[OptionsGenerator(FormStatusOptions::class)]
    #[ValueGenerator(DefaultStatusGenerator::class)]
    public SelectItem $defaultStatus;

    #[Label('Collect IP Addresses')]
    #[SetDefaultValue(true)]
    public BoolItem $collectIp;

    public function getLabel(): string
    {
        return 'Data Storage';
    }
}
