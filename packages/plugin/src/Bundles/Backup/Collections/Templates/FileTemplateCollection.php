<?php

namespace Solspace\Freeform\Bundles\Backup\Collections\Templates;

use Solspace\Freeform\Bundles\Backup\DTO\Templates\FileTemplate;
use Solspace\Freeform\Library\Collections\Collection;

/**
 * @extends Collection<FileTemplate>
 */
class FileTemplateCollection extends Collection
{
    protected static function supports(): array
    {
        return [FileTemplate::class];
    }
}
