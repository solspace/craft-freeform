<?php

namespace Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\Settings;

use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\BaseCategory;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\Settings\SubCategories\General;

class Settings extends BaseCategory
{
    public General $general;

    public function getLabel(): string
    {
        return 'Settings Defaults';
    }
}
