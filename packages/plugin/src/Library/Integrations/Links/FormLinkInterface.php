<?php

namespace Solspace\Freeform\Library\Integrations\Links;

use Solspace\Freeform\Form\Form;

interface FormLinkInterface
{
    public function getForm(): ?Form;
}
