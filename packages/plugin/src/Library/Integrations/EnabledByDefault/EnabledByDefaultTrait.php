<?php

namespace Solspace\Freeform\Library\Integrations\EnabledByDefault;

use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input\Boolean;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;

trait EnabledByDefaultTrait
{
    #[Flag(IntegrationInterface::FLAG_GLOBAL_PROPERTY)]
    #[Boolean(
        label: 'Enabled by default',
        instructions: 'If enabled, this integration will be enabled by default on all forms.',
        order: 0,
    )]
    protected bool $enabledByDefault = true;

    public function isEnabledByDefault(): bool
    {
        return $this->enabledByDefault;
    }
}
