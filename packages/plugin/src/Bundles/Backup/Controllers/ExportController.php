<?php

namespace Solspace\Freeform\Bundles\Backup\Controllers;

use Solspace\Freeform\Bundles\Backup\Export\ExpressFormsExporter;
use Solspace\Freeform\controllers\BaseApiController;

class ExportController extends BaseApiController
{
    protected function get(): array|object
    {
        $exporter = \Craft::$container->get(ExpressFormsExporter::class);

        return $exporter->collect();
    }
}
