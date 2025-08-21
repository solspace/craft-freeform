<?php

namespace Solspace\Freeform\Events\Integrations;

use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use yii\base\Event;

class BuildMappingContextEvent extends Event implements FormEventInterface
{
    public function __construct(
        private Form $form,
        private IntegrationInterface $integration,
        private array $context = [],
    ) {
        $this->context['form'] = $form;
        $this->context['integration'] = $integration;

        parent::__construct();
    }

    public function getForm(): Form
    {
        return $this->form;
    }

    public function getIntegration(): IntegrationInterface
    {
        return $this->integration;
    }

    public function getContext(): array
    {
        return $this->context;
    }

    public function setContext(array $context): self
    {
        $this->context = $context;

        return $this;
    }

    public function addContext(string $key, mixed $value): self
    {
        $this->context[$key] = $value;

        return $this;
    }
}
