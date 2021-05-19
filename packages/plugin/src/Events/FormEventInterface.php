<?php

namespace Solspace\Freeform\Events;

use Solspace\Freeform\Library\Composer\Components\Form;

interface FormEventInterface
{
    public function getForm(): Form;
}
