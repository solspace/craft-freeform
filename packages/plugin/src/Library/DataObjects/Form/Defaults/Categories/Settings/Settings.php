<?php

namespace Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\Settings;

use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\BaseCategory;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\Settings\SubCategories\DataStorage;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\Settings\SubCategories\General;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\Settings\SubCategories\Limits;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\Settings\SubCategories\Processing;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\Settings\SubCategories\SuccessAndErrors;

class Settings extends BaseCategory
{
    public General $general;
    public DataStorage $dataStorage;
    public Processing $processing;
    public SuccessAndErrors $successAndErrors;
    public Limits $limits;

    public function getLabel(): string
    {
        return 'Settings Defaults';
    }
}
