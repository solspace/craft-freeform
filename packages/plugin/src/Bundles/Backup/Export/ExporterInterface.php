<?php

namespace Solspace\Freeform\Bundles\Backup\Export;

use Solspace\Freeform\Bundles\Backup\DTO\FreeformDataset;
use Solspace\Freeform\Bundles\Backup\DTO\ImportPreview;

interface ExporterInterface
{
    public function setOptions(array $options): void;

    public function getOption(string $key): mixed;

    public function collect(): FreeformDataset;

    public function collectDataPreview(): ImportPreview;
}
