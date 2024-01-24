<?php

namespace Solspace\Freeform\Bundles\Backup\Controllers;

use Solspace\Freeform\Bundles\Backup\Export\ExpressFormsExporter;
use Solspace\Freeform\Bundles\Backup\Import\FreeformImporter;
use Solspace\Freeform\controllers\BaseApiController;

class ImportController extends BaseApiController
{
    protected function get(): array|object
    {
        $exporter = \Craft::$container->get(ExpressFormsExporter::class);
        $importer = \Craft::$container->get(FreeformImporter::class);
        $importer->import($exporter->collect());

        return [];
    }
}
