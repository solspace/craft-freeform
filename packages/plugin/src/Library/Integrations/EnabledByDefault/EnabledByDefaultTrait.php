<?php

namespace Solspace\Freeform\Library\Integrations\EnabledByDefault;

use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input\Boolean;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;

trait EnabledByDefaultTrait
{
    #[Flag(IntegrationInterface::FLAG_GLOBAL_PROPERTY)]
    #[Boolean(
        label: 'Enable on forms by default',
        instructions: 'Automatically enable this integration on forms. You can disable it for individual forms.',
        order: 0,
    )]
    protected bool $enabledByDefault = true;

    public function isEnabledByDefault(): bool
    {
        return $this->enabledByDefault;
    }
}
