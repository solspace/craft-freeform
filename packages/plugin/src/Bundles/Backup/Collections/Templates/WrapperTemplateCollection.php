<?php

namespace Solspace\Freeform\Bundles\Backup\Collections\Templates;

use Solspace\Freeform\Bundles\Backup\DTO\Templates\WrapperTemplate;
use Solspace\Freeform\Library\Collections\Collection;

/**
 * @extends Collection<WrapperTemplate>
 */
class WrapperTemplateCollection extends Collection
{
    protected static function supports(): array
    {
        return [WrapperTemplate::class];
    }
}
