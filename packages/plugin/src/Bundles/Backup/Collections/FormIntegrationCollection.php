<?php

namespace Solspace\Freeform\Bundles\Backup\Collections;

use Solspace\Freeform\Bundles\Backup\DTO\FormIntegration;
use Solspace\Freeform\Library\Collections\Collection;

/**
 * @extends Collection<FormIntegration>
 */
class FormIntegrationCollection extends Collection
{
    protected static function supports(): array
    {
        return [FormIntegration::class];
    }
}
