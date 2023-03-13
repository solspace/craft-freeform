<?php

namespace Solspace\Freeform\Events;

use Solspace\Freeform\Form\Form;

interface FormEventInterface
{
    public function getForm(): Form;
}
