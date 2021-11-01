<?php

namespace Solspace\Freeform\Bundles\Form\SaveForm\Actions;

use Solspace\Freeform\Library\DataObjects\AbstractFormAction;

class SaveFormAction extends AbstractFormAction
{
    public function getName(): string
    {
        return 'save-form';
    }
}
