<?php

namespace Solspace\Freeform\Resources\Bundles;

class ExportProfileBundle extends AbstractFreeformAssetBundle
{
    public function getScripts(): array
    {
        return ['js/scripts/cp/export-profiles/export-profile.js'];
    }
}
