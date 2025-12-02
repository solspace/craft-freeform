<?php

namespace Solspace\Freeform\Events\Integrations\ElementIntegrations;

use craft\base\ElementInterface;
use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Integrations\Types\Elements\ElementIntegrationInterface;

class ValidateEvent extends CancelableArrayableEvent implements FormEventInterface
{
    public function __construct(
        private Form $form,
        private ElementIntegrationInterface $integration,
        private ElementInterface $element,
    ) {
        parent::__construct();
    }

    public function fields(): array
    {
        return ['form', 'integration', 'element'];
    }

    public function getForm(): Form
    {
        return $this->form;
    }

    public function getIntegration(): ElementIntegrationInterface
    {
        return $this->integration;
    }

    public function getElement(): ElementInterface
    {
        return $this->element;
    }
}
