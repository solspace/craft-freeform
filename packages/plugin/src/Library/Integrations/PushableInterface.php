<?php

namespace Solspace\Freeform\Library\Integrations;

use GuzzleHttp\Client;
use Solspace\Freeform\Form\Form;

interface PushableInterface
{
    /**
     * Push objects to the CRM.
     */
    public function push(Form $form, Client $client): void;
}
