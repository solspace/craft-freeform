<?php

namespace Solspace\Freeform\Bundles\Backup\Export;

use Solspace\Freeform\Bundles\Backup\DTO\FreeformDataset;

interface ExporterInterface
{
    public function collect(
        bool $forms = true,
        bool $integrations = true,
        bool $notifications = true,
        bool $submissions = true,
        bool $settings = true,
    ): FreeformDataset;
}
