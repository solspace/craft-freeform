<?php

namespace Solspace\Freeform\Library\Rules\Types;

use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Library\Rules\Rule;

class IntegrationRule extends Rule
{
    private IntegrationInterface $integration;
    private bool $push;

    public function getIntegration(): IntegrationInterface
    {
        return $this->integration;
    }

    public function setIntegration(IntegrationInterface $integration): self
    {
        $this->integration = $integration;

        return $this;
    }

    public function isPush(): bool
    {
        return $this->push ?? true;
    }

    public function setPush(bool $push): self
    {
        $this->push = $push;

        return $this;
    }
}
