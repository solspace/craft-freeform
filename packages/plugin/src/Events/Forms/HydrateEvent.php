<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Composer\Components\Properties\FormProperties;
use Solspace\Freeform\Library\Composer\Components\Properties\ValidationProperties;

class HydrateEvent extends ArrayableEvent
{
    /** @var Form */
    private $form;

    /** @var FormProperties */
    private $formProperties;

    /** @var ValidationProperties */
    private $validationProperties;

    public function __construct(Form $form, FormProperties $formProperties, ValidationProperties $validationProperties)
    {
        $this->form = $form;
        $this->formProperties = $formProperties;
        $this->validationProperties = $validationProperties;

        parent::__construct([]);
    }

    public function fields(): array
    {
        return ['form', 'formProperties', 'validationProperties'];
    }

    public function getForm(): Form
    {
        return $this->form;
    }

    public function getFormProperties(): FormProperties
    {
        return $this->formProperties;
    }

    public function getValidationProperties(): ValidationProperties
    {
        return $this->validationProperties;
    }
}
