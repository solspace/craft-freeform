<?php

namespace Solspace\Freeform\Resources\Bundles;

class ExportButtonBundle extends AbstractFreeformAssetBundle
{
    public function getScripts(): array
    {
        if (version_compare(\Craft::$app->version, '6.0.0-dev', '>=')) {
            return [];
        }

        return ['js/scripts/cp/export-profiles/export-button.js'];
    }
}
