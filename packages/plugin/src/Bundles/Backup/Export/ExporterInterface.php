<?php

namespace Solspace\Freeform\Bundles\Backup\Export;

use Solspace\Freeform\Bundles\Backup\DTO\FreeformDataset;
use Solspace\Freeform\Bundles\Backup\DTO\ImportPreview;

interface ExporterInterface
{
    public function collectDataPreview(): ImportPreview;

    public function collect(
        array $formIds,
        array $notificationIds,
        array $formSubmissions,
        array $strategy,
    ): FreeformDataset;
}
