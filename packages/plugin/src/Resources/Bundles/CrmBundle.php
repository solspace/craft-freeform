<?php

namespace Solspace\Freeform\Resources\Bundles;

class CrmBundle extends AbstractFreeformAssetBundle
{
    public function getStylesheets(): array
    {
        return ['css/cp/integrations/integrations.css'];
    }
}
